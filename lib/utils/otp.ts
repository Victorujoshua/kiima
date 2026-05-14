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

  const supabase = createAdminClient();

  const { error: storeError } = await supabase
    .from('otp_verifications')
    .upsert(
      {
        email,
        otp,
        expires_at: expiresAt.toISOString(),
        purpose: 'bank_details',
      },
      { onConflict: 'email,purpose' }
    );

  if (storeError) {
    console.error('[otp] sendAndStoreOTP store error:', storeError.message);
    return { success: false, error: 'Failed to store OTP' };
  }

  return sendBankVerificationOTP({ email, firstName, otpCode: otp });
}

export async function verifyStoredOTP(
  email: string,
  otp: string
): Promise<{ valid: boolean; error?: string }> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('otp_verifications')
    .select('otp, expires_at')
    .eq('email', email)
    .eq('purpose', 'bank_details')
    .single();

  if (error || !data) {
    return { valid: false, error: 'No code found. Request a new one.' };
  }

  if (new Date() > new Date(data.expires_at)) {
    return { valid: false, error: 'Code expired. Request a new one.' };
  }

  if (data.otp !== otp) {
    return { valid: false, error: 'Invalid code. Try again.' };
  }

  // Delete after successful use so it can't be replayed
  await supabase
    .from('otp_verifications')
    .delete()
    .eq('email', email)
    .eq('purpose', 'bank_details');

  return { valid: true };
}
