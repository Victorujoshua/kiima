'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import SignupProgressBar from '@/components/auth/ProgressBar';
import UsernameStep     from '@/components/auth/UsernameStep';
import EmailPasswordStep from '@/components/auth/EmailPasswordStep';
import ProfileStep       from '@/components/auth/ProfileStep';
import VerifyBankStep    from '@/components/auth/VerifyBankStep';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep]       = useState<1 | 2 | 3 | 4>(1);
  const [username, setUsername] = useState('');
  const [userId, setUserId]     = useState('');
  const [email, setEmail]       = useState('');

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <div style={pageStyle}>
      {/* Top-right nav */}
      <div style={topRightStyle}>
        {step <= 2 ? (
          <p style={topNavTextStyle}>
            Already have an account?{' '}
            <Link href="/login" style={topNavLinkStyle}>Sign in</Link>
          </p>
        ) : (
          <button type="button" onClick={handleLogout} style={logoutBtnStyle}>
            Logout
          </button>
        )}
      </div>

      {/* Form area */}
      <div style={formAreaStyle}>
        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-black.svg" alt="Kiima" height={34} width={96} style={{ display: 'block', margin: '0 0 32px' }} />

        {/* Progress bar */}
        <SignupProgressBar step={step} total={4} />

        {/* Steps */}
        {step === 1 && (
          <UsernameStep
            onNext={(u) => { setUsername(u); setStep(2); }}
          />
        )}
        {step === 2 && (
          <EmailPasswordStep
            username={username}
            onBack={() => setStep(1)}
            onNext={(id, em) => { setUserId(id); setEmail(em); setStep(3); }}
          />
        )}
        {step === 3 && (
          <ProfileStep
            userId={userId}
            email={email}
            username={username}
            onNext={() => setStep(4)}
          />
        )}
        {step === 4 && (
          <VerifyBankStep
            userId={userId}
            email={email}
          />
        )}
      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  background: '#ffffff',
  minHeight: '100vh',
  position: 'relative',
};

const topRightStyle: React.CSSProperties = {
  position: 'fixed',
  top: 24,
  right: 24,
  zIndex: 200,
};

const topNavTextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#9A9089',
  margin: 0,
};

const topNavLinkStyle: React.CSSProperties = {
  color: '#1C1916',
  fontWeight: 700,
  textDecoration: 'none',
};

const logoutBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  fontWeight: 600,
  color: '#9A9089',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  textDecoration: 'underline',
};

const formAreaStyle: React.CSSProperties = {
  maxWidth: 560,
  margin: '0 auto',
  padding: '48px 24px 120px',
};

