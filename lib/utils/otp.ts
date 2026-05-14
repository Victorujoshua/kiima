import { createAdminClient } from '@/lib/supabase/admin';
import { sendBankVerificationOTP } from '@/lib/loops/emails';

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendAndStoreOTP(
  email: string,
  firstName: string
): Promise<{ success: boolean; error?: string }> {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  const normalizedEmail = email.toLowerCase().trim();

  const supabase = createAdminClient();

  // Delete any existing row first to avoid upsert conflict edge cases
  await supabase
    .from('otp_verifications')
    .delete()
    .eq('email', normalizedEmail)
    .eq('purpose', 'bank_details');

  const { error: storeError } = await supabase
    .from('otp_verifications')
    .insert({
      email: normalizedEmail,
      otp,
      expires_at: expiresAt.toISOString(),
      purpose: 'bank_details',
    });

  if (storeError) {
    console.error('[otp] sendAndStoreOTP store error:', storeError.message);
    return { success: false, error: 'Failed to store OTP' };
  }

  console.log('[otp] stored OTP for', normalizedEmail, '— code:', otp);
  return sendBankVerificationOTP({ email: normalizedEmail, firstName, otpCode: otp });
}

export async function verifyStoredOTP(
  email: string,
  otp: string
): Promise<{ valid: boolean; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedOtp = otp.trim();

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('otp_verifications')
    .select('otp, expires_at')
    .eq('email', normalizedEmail)
    .eq('purpose', 'bank_details')
    .single();

  console.log('[otp] verify lookup — email:', normalizedEmail, 'found:', !!data, 'error:', error?.message);

  if (error || !data) {
    return { valid: false, error: 'No code found. Request a new one.' };
  }

  const expired = new Date() > new Date(data.expires_at);
  console.log('[otp] stored:', data.otp, 'entered:', normalizedOtp, 'expired:', expired);

  if (expired) {
    return { valid: false, error: 'Code expired. Request a new one.' };
  }

  if (data.otp !== normalizedOtp) {
    return { valid: false, error: 'Invalid code. Try again.' };
  }

  // Delete after successful use so it can't be replayed
  await supabase
    .from('otp_verifications')
    .delete()
    .eq('email', normalizedEmail)
    .eq('purpose', 'bank_details');

  return { valid: true };
}
