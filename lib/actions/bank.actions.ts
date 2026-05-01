'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import {
  fetchSupportedBanks,
  resolveAccountName as paystackResolve,
  createPaystackSubaccount,
  type PaystackBank,
} from '@/lib/paystack/banks';

export type { PaystackBank };

export async function getBanks(): Promise<{ banks?: PaystackBank[]; error?: string }> {
  try {
    const banks = await fetchSupportedBanks();
    return { banks };
  } catch {
    return { error: 'Could not load banks — try again.' };
  }
}

export async function lookupAccountName(
  accountNumber: string,
  bankCode: string
): Promise<{ accountName?: string; error?: string }> {
  try {
    const accountName = await paystackResolve(accountNumber, bankCode);
    return { accountName };
  } catch {
    return { error: 'Could not verify account number.' };
  }
}

export async function saveBankDetails(
  userId: string,
  bankName: string,
  bankCode: string,
  accountNumber: string,
  accountName: string
): Promise<{ success?: boolean; error?: string }> {
  const admin = createAdminClient();

  const { data: settings } = await admin
    .from('platform_settings')
    .select('platform_fee_percent')
    .limit(1)
    .single();
  const percentageCharge = settings?.platform_fee_percent ?? 3;

  const { data: profile } = await admin
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .single();
  if (!profile) return { error: 'Profile not found.' };

  try {
    const subaccountCode = await createPaystackSubaccount({
      businessName: profile.display_name,
      bankCode,
      accountNumber,
      percentageCharge,
    });

    const { error } = await admin
      .from('profiles')
      .update({
        bank_name: bankName,
        bank_code: bankCode,
        account_number: accountNumber,
        account_name: accountName,
        paystack_subaccount_code: subaccountCode,
      })
      .eq('id', userId);

    if (error) return { error: 'Failed to save bank details — try again.' };
    return { success: true };
  } catch (err) {
    console.error('[saveBankDetails]', err);
    return { error: 'Could not set up payout account — try again.' };
  }
}
