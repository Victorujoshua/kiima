'use client';

import { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import KiimaButton from '@/components/shared/KiimaButton';
import GoogleButton from '@/components/shared/GoogleButton';
import { signupAction } from '@/lib/actions/auth.actions';
import type { Currency } from '@/types';

const CURRENCIES: { code: Currency; symbol: string }[] = [
  { code: 'NGN', symbol: '₦' },
  { code: 'USD', symbol: '$' },
  { code: 'GBP', symbol: '£' },
  { code: 'EUR', symbol: '€' },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <KiimaButton type="submit" loading={pending} fullWidth>
      Create my account
    </KiimaButton>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [state, formAction] = useFormState(signupAction, null);

  const [username, setUsername] = useState('');
  const [currency, setCurrency] = useState<Currency>('NGN');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state?.success && !state.emailConfirmationRequired) {
      router.push('/dashboard');
      router.refresh();
    }
  }, [state, router]);

  // ── Email confirmation screen ──────────────────────────────────────────
  if (state?.success && state.emailConfirmationRequired) {
    return (
      <main className="k-auth-page">
        <div style={cardStyle}>
          <div
            style={{
              width: '48px',
              height: '48px',
              background: 'var(--color-success-soft)',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-md)',
              fontSize: '22px',
            }}
          >
            📬
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontSize: '22px',
              color: 'var(--color-text-primary)',
              textAlign: 'center',
              marginBottom: 'var(--space-sm)',
            }}
          >
            Check your email
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              lineHeight: 1.65,
              color: 'var(--color-text-secondary)',
              textAlign: 'center',
              marginBottom: 'var(--space-lg)',
            }}
          >
            We sent you a confirmation link. Click it to activate your account,
            then come back and sign in.
          </p>
          <Link href="/login" style={{ display: 'block', textAlign: 'center' }}>
            <KiimaButton fullWidth>Go to sign in</KiimaButton>
          </Link>
        </div>
      </main>
    );
  }

  // ── Sign-up form ───────────────────────────────────────────────────────
  const fe = state?.fieldErrors ?? {};

  return (
    <main className="k-auth-page">
      <div style={cardStyle}>
        {/* Wordmark */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: '28px',
            color: 'var(--color-accent)',
            textAlign: 'center',
            marginBottom: 'var(--space-xs)',
          }}
        >
          Kiima
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            marginBottom: 'var(--space-2xl)',
          }}
        >
          Where giving feels natural
        </p>

        {/* Google sign-up */}
        <GoogleButton />

        {/* Divider */}
        <div style={dividerStyle}>
          <span style={dividerLineStyle} />
          <span style={dividerTextStyle}>or</span>
          <span style={dividerLineStyle} />
        </div>

        <form
          action={formAction}
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
        >
          {/* Hidden currency input — value is driven by the pill buttons */}
          <input type="hidden" name="currency" value={currency} />

          {/* Display name */}
          <div>
            <label htmlFor="display_name" style={labelStyle}>
              Your name
            </label>
            <input
              id="display_name"
              name="display_name"
              type="text"
              autoComplete="name"
              placeholder="How you'll appear to supporters"
              className={`k-input${fe.display_name ? ' k-input--error' : ''}`}
            />
            {fe.display_name && (
              <p style={fieldErrorStyle}>{fe.display_name}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" style={labelStyle}>
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="yourname"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
                )
              }
              className={`k-input${fe.username ? ' k-input--error' : ''}`}
            />
            {/* Live link preview */}
            {username && !fe.username && (
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: 'var(--color-text-muted)',
                  marginTop: 'var(--space-xs)',
                }}
              >
                Your link:{' '}
                <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                  kiima.app/{username}
                </span>
              </p>
            )}
            {fe.username && <p style={fieldErrorStyle}>{fe.username}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" style={labelStyle}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={`k-input${fe.email ? ' k-input--error' : ''}`}
            />
            {fe.email && <p style={fieldErrorStyle}>{fe.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" style={labelStyle}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="8 characters minimum"
                className={`k-input${fe.password ? ' k-input--error' : ''}`}
                style={{ paddingRight: '48px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={eyeBtnStyle}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {fe.password && <p style={fieldErrorStyle}>{fe.password}</p>}
          </div>

          {/* Currency */}
          <div>
            <p style={{ ...labelStyle, marginBottom: 'var(--space-sm)' }}>
              Your currency
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
              {CURRENCIES.map(({ code, symbol }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setCurrency(code)}
                  className={`k-currency-pill${currency === code ? ' k-currency-pill--selected' : ''}`}
                >
                  {symbol} {code}
                </button>
              ))}
            </div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'var(--color-text-faint)',
                marginTop: 'var(--space-xs)',
              }}
            >
              This is the currency your supporters will use to gift you.
            </p>
          </div>

          {/* Global error */}
          {state?.error && (
            <p style={errorBoxStyle} role="alert">
              {state.error}
            </p>
          )}

          <div style={{ marginTop: 'var(--space-sm)' }}>
            <SubmitButton />
          </div>
        </form>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            marginTop: 'var(--space-lg)',
          }}
        >
          Already on Kiima?{' '}
          <Link href="/login" style={linkStyle}>
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

// ── Shared styles ────────────────────────────────────────────────────────────

const dividerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  margin: 'var(--space-md) 0',
};

const dividerLineStyle: React.CSSProperties = {
  flex: 1,
  height: '1px',
  background: 'var(--color-border)',
  display: 'block',
};

const dividerTextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  color: 'var(--color-text-faint)',
  flexShrink: 0,
};

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--shadow-card)',
  padding: 'var(--space-xl)',
  maxWidth: '420px',
  width: '100%',
};

const eyeBtnStyle: React.CSSProperties = {
  position: 'absolute',
  right: '0',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  minWidth: '44px',
  minHeight: '44px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--color-text-muted)',
};

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

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--color-text-faint)',
  marginBottom: 'var(--space-xs)',
};

const fieldErrorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  color: 'var(--color-danger)',
  marginTop: 'var(--space-xs)',
};

const errorBoxStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--color-danger)',
  background: 'var(--color-danger-soft)',
  borderRadius: 'var(--radius-sm)',
  padding: '10px var(--space-md)',
  margin: 0,
};

const linkStyle: React.CSSProperties = {
  color: 'var(--color-accent)',
  fontWeight: 600,
  textDecoration: 'none',
};
