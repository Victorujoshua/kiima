'use server';

import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect';
import { createAdminClient } from '@/lib/supabase/admin';
import { initializePaystackTransaction } from '@/lib/paystack/initialize';
import { calculateAllFees } from '@/lib/utils/fee';

export interface InitializeGiftState {
  error?: string;
}

export async function initializeGift(
  _prevState: InitializeGiftState | null,
  formData: FormData
): Promise<InitializeGiftState> {
  const recipientId    = (formData.get('recipient_id') as string | null) ?? '';
  const tagId          = (formData.get('tag_id')        as string | null) || null;
  const rawAmount      = (formData.get('amount')         as string | null) ?? '';
  const rawDisplayName = (formData.get('display_name')   as string | null)?.trim() || null;
  const isAnonymous    = formData.get('is_anonymous') === 'true';
  const poolId         = (formData.get('pool_id') as string | null) || null;
  const note           = (formData.get('note') as string | null)?.trim() || null;

  // Section 4.3: anonymous choice always overrides
  const displayName = isAnonymous ? null : rawDisplayName;

  const giftAmount = Number(rawAmount);
  if (!recipientId || isNaN(giftAmount) || giftAmount <= 0) {
    return { error: 'Something went wrong — try again.' };
  }

  const supabase = createAdminClient();

  // Read platform_fee_percent — never hardcode
  const { data: settings } = await supabase
    .from('platform_settings')
    .select('platform_fee_percent')
    .limit(1)
    .single();

  const feePercent = settings?.platform_fee_percent ?? 3;

  // Server-side fee calculation — never trust client values
  const fees = calculateAllFees(giftAmount, feePercent);

  // Unique reference: kma_ prefix + timestamp + random suffix
  const reference = `kma_${Date.now()}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;

  // Fetch creator profile for currency + username
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('currency, username')
    .eq('id', recipientId)
    .single();

  if (profileError || !profile) {
    return { error: 'Something went wrong — try again.' };
  }

  // For pool contributions, fetch the pool slug for the callback URL
  let poolSlug: string | null = null;
  if (poolId) {
    const { data: pool, error: poolError } = await supabase
      .from('support_pools')
      .select('slug')
      .eq('id', poolId)
      .single();

    if (poolError || !pool) {
      return { error: 'Something went wrong — try again.' };
    }
    poolSlug = pool.slug;
  }

  const callbackUrl = poolSlug
    ? `${process.env.NEXT_PUBLIC_APP_URL}/${profile.username}/pool/${poolSlug}`
    : `${process.env.NEXT_PUBLIC_APP_URL}/gift/success`;

  // Insert PENDING contribution with all 5 fee fields
  const { error: insertError } = await supabase
    .from('contributions')
    .insert({
      recipient_id:   recipientId,
      pool_id:        poolId,
      tag_id:         tagId,
      gift_amount:    fees.gift_amount,
      paystack_fee:   fees.paystack_fee,
      kiima_fee:      fees.kiima_fee,
      creator_amount: fees.creator_amount,
      total_charged:  fees.total_charged,
      currency:       profile.currency,
      display_name:   displayName,
      is_anonymous:   isAnonymous,
      paystack_ref:   reference,
      status:         'pending',
    });

  if (insertError) {
    return { error: 'Something went wrong — try again.' };
  }

  try {
    // Charge total_charged (includes Paystack processing fee paid by gifter)
    const { authorizationUrl } = await initializePaystackTransaction({
      email:       'gift@kiima.app',
      amount:      fees.total_charged,
      currency:    profile.currency,
      reference,
      callbackUrl,
      metadata: {
        recipient_id:  recipientId,
        pool_id:       poolId,
        tag_id:        tagId,
        display_name:  displayName,
        is_anonymous:  isAnonymous,
      },
    });

    redirect(authorizationUrl);
  } catch (err) {
    if (isRedirectError(err)) throw err;

    // Paystack call failed — clean up the pending record
    await supabase
      .from('contributions')
      .delete()
      .eq('paystack_ref', reference);

    return { error: 'Payment could not be started — try again.' };
  }

  return {};
}
