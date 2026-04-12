'use server';

import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect';
import { createAdminClient } from '@/lib/supabase/admin';
import { initializePaystackTransaction } from '@/lib/paystack/initialize';

export interface InitializeGiftState {
  error?: string;
}

export async function initializeGift(
  _prevState: InitializeGiftState | null,
  formData: FormData
): Promise<InitializeGiftState> {
  const recipientId = (formData.get('recipient_id') as string | null) ?? '';
  const tagId       = (formData.get('tag_id')        as string | null) || null;
  const rawAmount   = (formData.get('amount')         as string | null) ?? '';
  const displayName = (formData.get('display_name')   as string | null)?.trim() || null;
  const isAnonymous = formData.get('is_anonymous') === 'true';

  const amount = Number(rawAmount);
  if (!recipientId || isNaN(amount) || amount <= 0) {
    return { error: 'Something went wrong — try again.' };
  }

  // Fee calculation — server-side only, never exposed to client
  const fee       = Math.round(amount * 0.03 * 100) / 100;
  const netAmount = Math.round((amount - fee) * 100) / 100;

  // Unique reference: kma_ prefix + timestamp + random suffix
  const reference = `kma_${Date.now()}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;

  const supabase = createAdminClient();

  // Fetch creator profile for currency + username
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('currency, username')
    .eq('id', recipientId)
    .single();

  if (profileError || !profile) {
    return { error: 'Something went wrong — try again.' };
  }

  // Insert PENDING contribution row before redirecting to Paystack
  const { error: insertError } = await supabase
    .from('contributions')
    .insert({
      recipient_id:  recipientId,
      pool_id:       null,
      tag_id:        tagId,
      amount,
      fee,
      net_amount:    netAmount,
      currency:      profile.currency,
      display_name:  displayName,
      is_anonymous:  isAnonymous,
      paystack_ref:  reference,
      status:        'pending',
    });

  if (insertError) {
    return { error: 'Something went wrong — try again.' };
  }

  try {
    const { authorizationUrl } = await initializePaystackTransaction({
      email:       'gift@kiima.co',
      amount,
      currency:    profile.currency,
      reference,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${profile.username}?gift=success`,
      metadata: {
        recipient_id:  recipientId,
        tag_id:        tagId,
        display_name:  displayName,
        is_anonymous:  isAnonymous,
      },
    });

    redirect(authorizationUrl);
  } catch (err) {
    // Re-throw redirect — next/navigation redirect() works via thrown error
    if (isRedirectError(err)) throw err;

    // Paystack call failed — clean up the pending record
    await supabase
      .from('contributions')
      .delete()
      .eq('paystack_ref', reference);

    return { error: 'Payment could not be started — try again.' };
  }

  // TypeScript requires a return but redirect() always throws
  return {};
}
