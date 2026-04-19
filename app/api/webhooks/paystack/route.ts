import { NextRequest, NextResponse } from 'next/server';
import { verifyPaystackSignature } from '@/lib/paystack/webhook';
import { createAdminClient } from '@/lib/supabase/admin';

// Paystack expects a 200 response for every event it delivers — even errors.
// Returning 4xx/5xx causes Paystack to retry, which can cause double-processing.
// Only 401 is returned (before DB work starts) when signature verification fails.

interface ChargeSuccessData {
  reference: string;
  amount: number;       // subunits
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
    // Malformed JSON — log and return 200 so Paystack doesn't retry
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
    // 5a. Look up contribution by paystack_ref
    const { data: contribution, error: lookupError } = await supabase
      .from('contributions')
      .select('id, pool_id, gift_amount, status')
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

    // 5d. Log success
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

    // Still return 200 — we've logged the failure; retrying won't help
    return NextResponse.json({ ok: true });
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
    // Logging must never throw — if it fails, we still return 200
    console.error('[webhook] Failed to write webhook_log:', params);
  }
}
