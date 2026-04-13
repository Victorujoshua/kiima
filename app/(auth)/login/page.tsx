'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import KiimaButton from '@/components/shared/KiimaButton';
import { loginAction } from '@/lib/actions/auth.actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <KiimaButton type="submit" loading={pending} fullWidth>
      Sign in
    </KiimaButton>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction] = useFormState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state?.success) {
      router.push('/dashboard');
      router.refresh();
    }
  }, [state, router]);

  return (
    <main className="k-auth-page">
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
          padding: 'var(--space-xl)',
          maxWidth: '420px',
          width: '100%',
        }}
      >
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
          Welcome back 🙏
        </p>

        <form
          action={formAction}
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
        >
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
              required
              className="k-input"
            />
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-xs)' }}>
              <label htmlFor="password" style={{ ...labelStyle, marginBottom: 0 }}>
                Password
              </label>
              <Link href="/forgot-password" style={{ ...linkStyle, fontSize: '12px', fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                required
                className="k-input"
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
          </div>

          {/* Error */}
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
          New to Kiima?{' '}
          <Link href="/signup" style={linkStyle}>
            Create your account
          </Link>
        </p>
      </div>
    </main>
  );
}

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
