'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import KiimaButton from '@/components/shared/KiimaButton';
import { resetPasswordAction } from '@/lib/actions/auth.actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <KiimaButton type="submit" loading={pending} fullWidth>
      Set new password
    </KiimaButton>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [state, formAction] = useFormState(resetPasswordAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setTimeout(() => router.push('/login'), 2000);
    }
  }, [state, router]);

  if (state?.success) {
    return (
      <main style={pageStyle}>
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
            ✅
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
            Password updated!
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              lineHeight: 1.65,
              color: 'var(--color-text-secondary)',
              textAlign: 'center',
            }}
          >
            Your password has been set. Redirecting you to sign in…
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
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
          Choose a new password
        </p>

        <form
          action={formAction}
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
        >
          {/* New password */}
          <div>
            <label htmlFor="password" style={labelStyle}>
              New password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="8 characters minimum"
                required
                className="k-input"
                style={{ paddingRight: '40px' }}
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

          {/* Confirm password */}
          <div>
            <label htmlFor="confirm" style={labelStyle}>
              Confirm password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirm"
                name="confirm"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Repeat your password"
                required
                className="k-input"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                style={eyeBtnStyle}
              >
                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

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
          <Link href="/login" style={linkStyle}>
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

const eyeBtnStyle: React.CSSProperties = {
  position: 'absolute',
  right: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '2px',
  color: 'var(--color-text-muted)',
  display: 'flex',
  alignItems: 'center',
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

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--space-xl)',
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
