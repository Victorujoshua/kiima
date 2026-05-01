'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import GoogleButton from '@/components/shared/GoogleButton';

interface Props {
  username: string;
  onBack: () => void;
  onNext: (userId: string, email: string) => void;
}

export default function EmailPasswordStep({ username, onBack, onNext }: Props) {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPwd, setShowPwd]       = useState(false);
  const [loading, setLoading]       = useState(false);
  const [emailErr, setEmailErr]     = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [globalErr, setGlobalErr]   = useState('');

  async function handleSubmit() {
    setEmailErr('');
    setPasswordErr('');
    setGlobalErr('');

    let hasError = false;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailErr('Please enter a valid email address.');
      hasError = true;
    }
    if (password.length < 8) {
      setPasswordErr('Password must be at least 8 characters.');
      hasError = true;
    }
    if (hasError) return;

    setLoading(true);
    const supabase = createClient();
    const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${appUrl}/auth/callback` },
    });

    setLoading(false);

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('already in use')) {
        setEmailErr('An account with this email already exists.');
      } else if (msg.includes('rate limit') || msg.includes('too many')) {
        setGlobalErr('Too many attempts — please wait a moment and try again.');
      } else if (msg.includes('password') || msg.includes('weak')) {
        setPasswordErr('Password is too weak — please choose a stronger one.');
      } else {
        setGlobalErr('Something went wrong — try again.');
      }
      return;
    }

    if (!data.user) {
      setGlobalErr('Something went wrong — try again.');
      return;
    }

    onNext(data.user.id, data.user.email ?? email);
  }

  return (
    <>
      <div style={{ paddingBottom: 100 }}>
        <h1 style={headingStyle}>Create your account</h1>
        <p style={subStyle}>Enter your email and choose a password.</p>

        {/* Username confirmation pill */}
        <div style={confirmPillStyle}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#9A9089' }}>kiima.app/</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, color: '#1C1916' }}>{username}</span>
          <span style={{ color: '#3D9B56', fontSize: 13, marginLeft: 4 }}>✓</span>
          <button type="button" onClick={onBack} style={changeStyle}>Change</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
          {/* Email */}
          <div>
            <div style={{ ...pillInputStyle, borderColor: emailErr ? '#E07070' : 'transparent' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                autoComplete="email"
                style={rawInputStyle}
              />
            </div>
            {emailErr && <p style={fieldErrStyle}>{emailErr}</p>}
          </div>

          {/* Password */}
          <div>
            <div style={{ ...pillInputStyle, borderColor: passwordErr ? '#E07070' : 'transparent' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password (8+ characters)"
                autoComplete="new-password"
                style={{ ...rawInputStyle, flex: 1 }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', color: '#9A9089', flexShrink: 0 }}
                aria-label={showPwd ? 'Hide password' : 'Show password'}
              >
                {showPwd ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {passwordErr && <p style={fieldErrStyle}>{passwordErr}</p>}
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
          <span style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#B5AAAA' }}>or</span>
          <span style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
        </div>

        <GoogleButton />

        {globalErr && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#E07070', marginTop: 16, margin: '16px 0 0' }}>
            {globalErr}
          </p>
        )}
      </div>

      {/* Fixed bottom bar */}
      <div style={bottomBarStyle}>
        <div style={bottomInnerStyle}>
          <p style={termsStyle}>
            By continuing you agree to our{' '}
            <a href="/terms" style={termsLinkStyle}>terms</a> and{' '}
            <a href="/privacy" style={termsLinkStyle}>privacy policy</a>
          </p>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ ...ctaBtnStyle, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Creating...' : 'Sign up'}
          </button>
        </div>
      </div>
    </>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 800,
  fontSize: 32,
  color: '#1C1916',
  letterSpacing: '-0.5px',
  margin: '0 0 8px',
};

const subStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 16,
  color: '#9A9089',
  margin: '0 0 24px',
};

const confirmPillStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  background: '#f3f3f3',
  borderRadius: 100,
  padding: '8px 16px',
};

const changeStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 12,
  fontWeight: 600,
  color: '#9A9089',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  textDecoration: 'underline',
  padding: '0 0 0 8px',
};

const pillInputStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  background: '#f3f3f3',
  borderRadius: 100,
  padding: '16px 24px',
  border: '2px solid transparent',
  transition: 'border-color 0.15s ease',
};

const rawInputStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 16,
  color: '#1C1916',
  background: 'transparent',
  border: 'none',
  outline: 'none',
  width: '100%',
};

const fieldErrStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 12,
  color: '#E07070',
  margin: '6px 0 0 16px',
};

const bottomBarStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  background: '#ffffff',
  borderTop: '1px solid #f0f0f0',
  zIndex: 100,
};

const bottomInnerStyle: React.CSSProperties = {
  maxWidth: 560,
  margin: '0 auto',
  padding: '14px 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
};

const termsStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 12,
  color: '#9A9089',
  margin: 0,
  lineHeight: 1.5,
  maxWidth: 220,
};

const termsLinkStyle: React.CSSProperties = {
  color: '#1C1916',
  fontWeight: 600,
  textDecoration: 'underline',
};

const ctaBtnStyle: React.CSSProperties = {
  background: '#D7D744',
  color: '#1C1916',
  border: 'none',
  borderRadius: 100,
  padding: '14px 28px',
  fontFamily: 'var(--font-body)',
  fontWeight: 800,
  fontSize: 15,
  whiteSpace: 'nowrap',
  flexShrink: 0,
  transition: 'opacity 0.15s ease',
};
