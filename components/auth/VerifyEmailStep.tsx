'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import OtpInput from '@/components/auth/OtpInput';

interface Props {
  email: string;
}

export default function VerifyEmailStep({ email }: Props) {
  const router = useRouter();
  const [otp, setOtp]           = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    if (otp.length === 6 && !loading) {
      handleVerify(otp);
    }
  }, [otp]);

  async function handleVerify(code: string) {
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'signup',
    });
    setLoading(false);
    if (verifyError) {
      setError('Invalid code — check your email and try again.');
      setOtp('');
    } else {
      router.push('/dashboard');
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resending) return;
    setResending(true);
    const supabase = createClient();
    await supabase.auth.resend({ type: 'signup', email });
    setResending(false);
    setCooldown(60);
    setOtp('');
    setError('');
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      <h2 style={headingStyle}>Verify your email</h2>
      <p style={subStyle}>
        We sent a 6-digit code to <strong>{email}</strong>. Enter it to finish setting up your account.
      </p>

      <OtpInput value={otp} onChange={setOtp} disabled={loading} />

      {error && (
        <p style={errorStyle}>{error}</p>
      )}
      {loading && (
        <p style={mutedStyle}>Verifying…</p>
      )}

      <p style={{ ...mutedStyle, marginTop: 20 }}>
        Didn&apos;t receive it?{' '}
        {cooldown > 0 ? (
          <span>Resend in {cooldown}s</span>
        ) : (
          <button type="button" onClick={handleResend} disabled={resending} style={resendBtnStyle}>
            {resending ? 'Sending…' : 'Resend code'}
          </button>
        )}
      </p>

      <div style={fixedBarStyle}>
        <p style={hintStyle}>Once verified you&apos;ll go straight to your dashboard.</p>
      </div>
    </div>
  );
}

const headingStyle: React.CSSProperties = {
  fontFamily:    'var(--font-body)',
  fontWeight:    800,
  fontSize:      26,
  color:         '#1C1916',
  margin:        '32px 0 8px',
  letterSpacing: '-0.4px',
};

const subStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize:   14,
  color:      '#9A9089',
  margin:     '0 0 28px',
  lineHeight: 1.55,
};

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize:   13,
  color:      '#E07070',
  marginTop:  12,
};

const mutedStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize:   13,
  color:      '#9A9089',
  margin:     '12px 0 0',
};

const resendBtnStyle: React.CSSProperties = {
  fontFamily:     'var(--font-body)',
  fontSize:       13,
  fontWeight:     600,
  color:          '#1C1916',
  background:     'none',
  border:         'none',
  cursor:         'pointer',
  textDecoration: 'underline',
  padding:        0,
};

const fixedBarStyle: React.CSSProperties = {
  position: 'fixed',
  bottom:   0,
  left:     0,
  right:    0,
  background: '#ffffff',
  borderTop:  '1px solid #F0F0F0',
  padding:    '16px 24px',
  display:    'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const hintStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize:   13,
  color:      '#9A9089',
  margin:     0,
  textAlign:  'center',
};
