'use server';

import { createClient } from '@/lib/supabase/server';

export async function requestWithdrawal(
  amount: number
): Promise<{ success?: boolean; error?: string }> {
  if (!amount || amount <= 0) return { error: 'Please enter a valid amount.' };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated — please sign in again.' };

  // Get profile bank details + currency
  const { data: profile } = await supabase
    .from('profiles')
    .select('bank_name, account_number, account_name, currency')
    .eq('id', user.id)
    .single();

  if (!profile?.bank_name || !profile?.account_number) {
    return { error: 'Please add a bank account in Settings before withdrawing.' };
  }

  // Compute available balance server-side — sum(confirmed gifts) - sum(non-cancelled withdrawals)
  const [contribResult, withdrawResult] = await Promise.all([
    supabase
      .from('contributions')
      .select('gift_amount')
      .eq('recipient_id', user.id)
      .eq('status', 'confirmed'),
    supabase
      .from('withdrawals')
      .select('amount')
      .eq('user_id', user.id)
      .neq('status', 'cancelled'),
  ]);

  const totalReceived  = (contribResult.data ?? []).reduce((s, c) => s + Number(c.gift_amount), 0);
  const totalWithdrawn = (withdrawResult.data ?? []).reduce((s, w) => s + Number(w.amount), 0);
  const available      = totalReceived - totalWithdrawn;

  if (amount > available) {
    return { error: 'Amount exceeds your available balance.' };
  }

  const { error } = await supabase.from('withdrawals').insert({
    user_id:        user.id,
    amount,
    currency:       profile.currency,
    bank_name:      profile.bank_name,
    account_number: profile.account_number,
    account_name:   profile.account_name ?? '',
    status:         'pending',
  });

  if (error) {
    console.error('[requestWithdrawal]', error.message);
    return { error: 'Something went wrong — try again.' };
  }

  return { success: true };
}
