'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import KiimaButton from '@/components/shared/KiimaButton';
import { forgotPasswordAction } from '@/lib/actions/auth.actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <KiimaButton type="submit" loading={pending} fullWidth>
      Send reset link
    </KiimaButton>
  );
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState(forgotPasswordAction, null);

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
            Check your inbox
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
            If that email is registered, we've sent a password reset link.
            Check your inbox and follow the link to set a new password.
          </p>
          <Link href="/login" style={{ display: 'block' }}>
            <KiimaButton fullWidth>Back to sign in</KiimaButton>
          </Link>
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
          Reset your password
        </p>

        <form
          action={formAction}
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
        >
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
