import { NextRequest, NextResponse } from 'next/server';
import { verifyPaystackSignature } from '@/lib/paystack/webhook';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatCurrency } from '@/lib/utils/currency';
import {
  sendGiftReceivedEmail,
  sendPoolContributionEmail,
} from '@/lib/loops/emails';

interface ChargeSuccessData {
  reference: string;
  amount: number;
  status: string;
  [key: string]: unknown;
}

interface PaystackEvent {
  event: string;
  data: ChargeSuccessData;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 1. Read raw body ──────────────────────────────────────────────────────
  const rawBody = await req.text();
  const signature = req.headers.get('x-paystack-signature');

  // ── 2. Verify signature ───────────────────────────────────────────────────
  if (!verifyPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // ── 3. Parse event ────────────────────────────────────────────────────────
  let event: PaystackEvent;
  try {
    event = JSON.parse(rawBody) as PaystackEvent;
  } catch {
    await logWebhookEvent({
      event_type: 'unknown',
      paystack_ref: null,
      payload: { raw: rawBody },
      status: 'failed',
      error_message: 'Failed to parse JSON body',
    });
    return NextResponse.json({ ok: true });
  }

  const eventType   = event.event;
  const paystackRef = event.data?.reference ?? null;

  // ── 4. Ignore non-charge.success events ──────────────────────────────────
  if (eventType !== 'charge.success') {
    await logWebhookEvent({
      event_type: eventType,
      paystack_ref: paystackRef,
      payload: event as unknown as Record<string, unknown>,
      status: 'ignored',
      error_message: null,
    });
    return NextResponse.json({ ok: true });
  }

  // ── 5. Handle charge.success ──────────────────────────────────────────────
  const supabase = createAdminClient();

  try {
    // 5a. Look up contribution by paystack_ref — include all fields needed for emails
    const { data: contribution, error: lookupError } = await supabase
      .from('contributions')
      .select('id, recipient_id, pool_id, tag_id, gift_amount, currency, display_name, is_anonymous, status, note')
      .eq('paystack_ref', paystackRef)
      .single();

    if (lookupError || !contribution) {
      await logWebhookEvent({
        event_type: eventType,
        paystack_ref: paystackRef,
        payload: event as unknown as Record<string, unknown>,
        status: 'failed',
        error_message: `Contribution not found for ref: ${paystackRef}`,
      });
      return NextResponse.json({ ok: true });
    }

    // Guard against double-processing (Paystack may retry)
    if (contribution.status === 'confirmed') {
      await logWebhookEvent({
        event_type: eventType,
        paystack_ref: paystackRef,
        payload: event as unknown as Record<string, unknown>,
        status: 'ignored',
        error_message: 'Contribution already confirmed — duplicate webhook',
      });
      return NextResponse.json({ ok: true });
    }

    // 5b. Update contribution status → confirmed
    const { error: updateError } = await supabase
      .from('contributions')
      .update({ status: 'confirmed' })
      .eq('id', contribution.id);

    if (updateError) throw new Error(`Failed to confirm contribution: ${updateError.message}`);

    // 5c. If pool contribution → increment support_pools.raised by gift_amount
    if (contribution.pool_id) {
      const { error: rpcError } = await supabase.rpc('increment_pool_raised', {
        p_pool_id:   contribution.pool_id,
        p_increment: contribution.gift_amount,
      });

      // Fallback read-modify-write if RPC not yet deployed
      if (rpcError) {
        const { data: pool } = await supabase
          .from('support_pools')
          .select('raised')
          .eq('id', contribution.pool_id)
          .single();

        if (pool) {
          await supabase
            .from('support_pools')
            .update({ raised: Number(pool.raised) + Number(contribution.gift_amount) })
            .eq('id', contribution.pool_id);
        }
      }
    }

    // 5d. Send notification email to creator (fire-and-forget — never throws)
    try {
      const emailResult = await sendCreatorNotificationEmail(supabase, contribution);
      console.log('[webhook] Email result:', JSON.stringify(emailResult));
    } catch (emailErr) {
      console.error('[webhook] Email notification failed:', emailErr);
    }

    // 5e. Log success
    await logWebhookEvent({
      event_type: eventType,
      paystack_ref: paystackRef,
      payload: event as unknown as Record<string, unknown>,
      status: 'processed',
      error_message: null,
    });

    return NextResponse.json({ ok: true });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    await logWebhookEvent({
      event_type: eventType,
      paystack_ref: paystackRef,
      payload: event as unknown as Record<string, unknown>,
      status: 'failed',
      error_message: message,
    });

    return NextResponse.json({ ok: true });
  }
}

// ─── Email notification helper ────────────────────────────────────────────────

async function sendCreatorNotificationEmail(
  supabase: ReturnType<typeof createAdminClient>,
  contribution: {
    recipient_id: string;
    pool_id: string | null;
    tag_id: string | null;
    gift_amount: number;
    currency: string;
    display_name: string | null;
    is_anonymous: boolean;
    note: string | null;
  }
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

  // Fetch creator auth record (for email) and profile (for name/username) in parallel
  const [authResult, profileResult] = await Promise.all([
    supabase.auth.admin.getUserById(contribution.recipient_id),
    supabase
      .from('profiles')
      .select('display_name, username')
      .eq('id', contribution.recipient_id)
      .single(),
  ]);

  const creatorEmail = authResult.data.user?.email;
  const profile      = profileResult.data;

  if (!creatorEmail || !profile) {
    console.warn('[webhook] Missing creator email or profile for recipient:', contribution.recipient_id);
    return { success: false, error: 'No creator email or profile' };
  }

  // ✅ Safe split — won't crash if display_name is null
  const creatorFirstName = (profile.display_name ?? profile.username ?? 'Creator').split(' ')[0];

  const senderName = contribution.is_anonymous
    ? 'Someone'
    : contribution.display_name ?? 'Someone';

  const giftAmount = formatCurrency(
    contribution.gift_amount,
    contribution.currency as import('@/types').Currency
  );

  if (!contribution.pool_id) {
    // Direct gift — fetch tag label if there is one
    let tagLabel: string | null = null;
    if (contribution.tag_id) {
      const { data: tag } = await supabase
        .from('gift_tags')
        .select('label, amount')
        .eq('id', contribution.tag_id)
        .single();
      if (tag) {
        const qty = tag.amount > 0 ? Math.round(Number(contribution.gift_amount) / Number(tag.amount)) : 1;
        tagLabel = qty > 1 ? `${qty}× ${tag.label}` : tag.label;
      }
    }

    await sendGiftReceivedEmail({
      creatorEmail,
      creatorFirstName,
      senderName,
      giftAmount,
      tagUsed:      tagLabel,
      notePreview:  contribution.note ?? null, // ✅ real note now
      dashboardUrl: `${appUrl}/dashboard`,
    });
  } else {
    // Pool contribution — fetch pool details
    const { data: pool } = await supabase
      .from('support_pools')
      .select('title, raised, goal_amount, slug, currency')
      .eq('id', contribution.pool_id)
      .single();

    if (!pool) return;

    const isGoalReached = Number(pool.raised) >= Number(pool.goal_amount);

    await sendPoolContributionEmail({
      creatorEmail,
      creatorFirstName,
      senderName,
      giftAmount,
      poolTitle:   pool.title,
      poolRaised:  formatCurrency(Number(pool.raised), pool.currency as import('@/types').Currency),
      poolGoal:    formatCurrency(Number(pool.goal_amount), pool.currency as import('@/types').Currency),
      poolPercent: Math.round((Number(pool.raised) / Number(pool.goal_amount)) * 100),
      poolUrl:     `${appUrl}/${profile.username}/pool/${pool.slug}`,
      isGoalReached,
    });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface LogParams {
  event_type: string;
  paystack_ref: string | null;
  payload: Record<string, unknown>;
  status: 'processed' | 'failed' | 'ignored';
  error_message: string | null;
}

async function logWebhookEvent(params: LogParams): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from('webhook_logs').insert(params);
  } catch {
    console.error('[webhook] Failed to write webhook_log:', params);
  }
}