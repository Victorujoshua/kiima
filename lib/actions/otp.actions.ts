'use server';

import { createClient } from '@/lib/supabase/server';
import { sendAndStoreOTP, verifyStoredOTP } from '@/lib/utils/otp';

export async function sendBankOTP(): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { success: false, error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single();

  const firstName = profile?.display_name?.split(' ')[0] ?? 'there';

  return sendAndStoreOTP(user.email, firstName);
}

export async function confirmBankOTP(
  otp: string
): Promise<{ valid: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { valid: false, error: 'Not authenticated' };

  return verifyStoredOTP(user.email, otp);
}
