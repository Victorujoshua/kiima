'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { verifyPaystackTransaction } from '@/lib/paystack/verify';
import type { PlatformSettings } from '@/types';

export async function suspendCreator(creatorId: string): Promise<{ error?: string }> {
  const admin = createAdminClient();
  const { error } = await admin
    .from('profiles')
    .update({ suspended: true })
    .eq('id', creatorId);
  if (error) return { error: 'Could not suspend creator — try again.' };
  return {};
}

export async function unsuspendCreator(creatorId: string): Promise<{ error?: string }> {
  const admin = createAdminClient();
  const { error } = await admin
    .from('profiles')
    .update({ suspended: false })
    .eq('id', creatorId);
  if (error) return { error: 'Could not unsuspend creator — try again.' };
  return {};
}

export async function forceClosePool(poolId: string): Promise<{ error?: string }> {
  const admin = createAdminClient();
  const { data: pool } = await admin
    .from('support_pools')
    .select('status')
    .eq('id', poolId)
    .single();
  if (!pool) return { error: 'Pool not found.' };
  if (pool.status === 'closed') return { error: 'Pool is already closed.' };
  const { error } = await admin
    .from('support_pools')
    .update({ status: 'closed' })
    .eq('id', poolId);
  if (error) return { error: 'Could not close pool — try again.' };
  return {};
}

export async function deleteCustomTag(tagId: string): Promise<{ error?: string }> {
  const admin = createAdminClient();
  const { data: tag } = await admin
    .from('gift_tags')
    .select('is_default')
    .eq('id', tagId)
    .single();
  if (!tag) return { error: 'Tag not found.' };
  if (tag.is_default) return { error: 'The default tag cannot be deleted.' };
  const { error } = await admin
    .from('gift_tags')
    .delete()
    .eq('id', tagId)
    .eq('is_default', false); // double guard
  if (error) return { error: 'Could not delete tag — try again.' };
  return {};
}

export async function updatePlatformSettings(
  settings: Partial<
    Pick<
      PlatformSettings,
      | 'default_tag_amount_ngn'
      | 'default_tag_amount_usd'
      | 'default_tag_amount_gbp'
      | 'default_tag_amount_eur'
      | 'maintenance_mode'
    >
  >
): Promise<{ error?: string }> {
  const admin = createAdminClient();
  const { error } = await admin
    .from('platform_settings')
    .update({ ...settings, updated_at: new Date().toISOString() })
    .not('id', 'is', null); // matches the single row
  if (error) return { error: 'Could not save settings — try again.' };
  return {};
}

export async function recheckPaystackPayment(paystackRef: string): Promise<{
  error?: string;
  confirmed?: boolean;
  alreadyConfirmed?: boolean;
}> {
  try {
    const txn = await verifyPaystackTransaction(paystackRef);
    if (txn.status !== 'success') {
      return { error: `Payment status on Paystack is "${txn.status}" — not confirmed.` };
    }

    const admin = createAdminClient();
    const { data: contribution } = await admin
      .from('contributions')
      .select('id, pool_id, gift_amount, status')
      .eq('paystack_ref', paystackRef)
      .single();

    if (!contribution) return { error: 'Contribution not found in database.' };
    if (contribution.status === 'confirmed') return { alreadyConfirmed: true };

    const { error: updateError } = await admin
      .from('contributions')
      .update({ status: 'confirmed' })
      .eq('id', contribution.id);

    if (updateError) return { error: 'Could not confirm payment — try again.' };

    // Increment pool raised if this was a pool contribution
    if (contribution.pool_id) {
      const { data: pool } = await admin
        .from('support_pools')
        .select('raised')
        .eq('id', contribution.pool_id)
        .single();
      if (pool) {
        await admin
          .from('support_pools')
          .update({ raised: pool.raised + contribution.gift_amount })
          .eq('id', contribution.pool_id);
      }
    }

    return { confirmed: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { error: message };
  }
}
