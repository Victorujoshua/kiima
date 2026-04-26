'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  checkUsernameAvailable,
  completeGoogleOnboarding,
} from '@/lib/actions/auth.actions';
import type { Currency } from '@/types';

const CURRENCIES: { code: Currency; symbol: string }[] = [
  { code: 'NGN', symbol: '₦' },
  { code: 'USD', symbol: '$' },
  { code: 'GBP', symbol: '£' },
  { code: 'EUR', symbol: '€' },
];

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export default function OnboardingPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [step, setStep] = useState<1 | 2>(1);

  // User data from Google
  const [userId, setUserId] = useState('');
  const [googleAvatarUrl, setGoogleAvatarUrl] = useState<string | null>(null);

  // Form fields
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [currency, setCurrency] = useState<Currency>('NGN');

  // Username availability
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const [usernameMsg, setUsernameMsg] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ── Guard: must be authenticated, no existing profile ──────────────────
  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        router.replace('/dashboard');
        return;
      }

      // Pre-fill from Google metadata
      const meta = user.user_metadata ?? {};
      setUserId(user.id);
      setDisplayName(meta.full_name ?? meta.name ?? '');
      setGoogleAvatarUrl(meta.avatar_url ?? meta.picture ?? null);
      setAuthLoading(false);
    }
    check();
  }, [router]);

  // ── Username availability check (debounced) ──────────────────────────
  function handleUsernameChange(value: string) {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleaned);
    setUsernameStatus('idle');
    setUsernameMsg('');

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!cleaned || cleaned.length < 3) return;

    debounceRef.current = setTimeout(async () => {
      setUsernameStatus('checking');
      const result = await checkUsernameAvailable(cleaned);
      if (result.error) {
        setUsernameStatus('invalid');
        setUsernameMsg(result.error);
      } else if (result.available) {
        setUsernameStatus('available');
        setUsernameMsg(`kiima.app/${cleaned} is available`);
      } else {
        setUsernameStatus('taken');
        setUsernameMsg('This username is taken');
      }
    }, 500);
  }

  // ── Step 1 submit ─────────────────────────────────────────────────────
  async function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setFormError('');

    if (usernameStatus === 'taken' || usernameStatus === 'invalid') return;
    if (usernameStatus === 'checking') return;

    setSubmitting(true);
    const result = await completeGoogleOnboarding({
      username,
      displayName,
      currency,
      avatarUrl: googleAvatarUrl,
    });
    setSubmitting(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }
    if (result.fieldErrors) {
      setFieldErrors(result.fieldErrors as Record<string, string>);
      return;
    }

    setStep(2);
  }

  // ── Step 2 skip → dashboard ──────────────────────────────────────────
  function handleSkipToDashboard() {
    router.push('/dashboard');
    router.refresh();
  }

  // ── Loading screen ────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <main style={pageStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <span style={spinnerStyle} />
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        {/* Logo */}
        <p style={logoStyle}>kiima<span style={{ color: 'var(--color-accent)' }}>.</span></p>

        {/* Progress */}
        <div style={progressBarWrapStyle}>
          <div style={{ ...progressSegmentStyle, background: 'var(--color-accent)' }} />
          <div style={{ ...progressSegmentStyle, background: step === 2 ? 'var(--color-accent)' : 'var(--color-border)' }} />
        </div>
        <p style={progressTextStyle}>Step {step} of 2</p>

        {step === 1 ? (
          <>
            <h1 style={headingStyle}>Welcome to Kiima 👋</h1>
            <p style={subStyle}>Let&apos;s set up your creator profile.</p>

            <form onSubmit={handleStep1Submit} style={formStyle}>

              {/* Display name */}
              <div>
                <label style={labelStyle}>Your name</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How you'll appear to supporters"
                  className={`k-input${fieldErrors.display_name ? ' k-input--error' : ''}`}
                  required
                />
                {fieldErrors.display_name && (
                  <p style={fieldErrStyle}>{fieldErrors.display_name}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <label style={labelStyle}>Username</label>
                <input
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="yourname"
                  className={`k-input${fieldErrors.username || usernameStatus === 'taken' || usernameStatus === 'invalid' ? ' k-input--error' : ''}`}
                  required
                />
                {usernameStatus === 'checking' && (
                  <p style={{ ...fieldErrStyle, color: 'var(--color-text-muted)' }}>Checking availability...</p>
                )}
                {usernameStatus === 'available' && (
                  <p style={{ ...fieldErrStyle, color: 'var(--color-success)' }}>✓ {usernameMsg}</p>
                )}
                {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                  <p style={fieldErrStyle}>✗ {usernameMsg}</p>
                )}
                {fieldErrors.username && (
                  <p style={fieldErrStyle}>{fieldErrors.username}</p>
                )}
              </div>

              {/* Currency */}
              <div>
                <p style={{ ...labelStyle, marginBottom: 'var(--space-sm)' }}>Your currency</p>
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
                <p style={hintStyle}>This is the currency your supporters will use to gift you.</p>
              </div>

              {formError && (
                <p style={errorBoxStyle} role="alert">{formError}</p>
              )}

              <button
                type="submit"
                disabled={submitting || usernameStatus === 'checking' || usernameStatus === 'taken' || usernameStatus === 'invalid'}
                style={{
                  ...submitBtnStyle,
                  opacity: submitting || usernameStatus === 'checking' ? 0.7 : 1,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Setting up...' : 'Continue →'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 style={headingStyle}>Almost there! 🎉</h1>
            <p style={subStyle}>Add your bank details to receive payouts directly to your account.</p>

            <div style={bankSkipBoxStyle}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: 0 }}>
                Bank details can be added any time from your <strong>Settings</strong> page. You can skip this for now and go straight to your dashboard.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
              <button onClick={handleSkipToDashboard} style={submitBtnStyle}>
                Go to my dashboard →
              </button>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-faint)', textAlign: 'center', margin: 0 }}>
                You can add bank details later in Settings
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px 20px',
};

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--shadow-card)',
  padding: 'var(--space-xl)',
  maxWidth: '480px',
  width: '100%',
};

const logoStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 500,
  fontSize: '28px',
  color: 'var(--color-accent)',
  textAlign: 'center',
  margin: '0 0 var(--space-lg)',
};

const progressBarWrapStyle: React.CSSProperties = {
  display: 'flex',
  gap: '6px',
  marginBottom: '8px',
};

const progressSegmentStyle: React.CSSProperties = {
  flex: 1,
  height: '3px',
  borderRadius: '2px',
  transition: 'background 0.3s ease',
};

const progressTextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--color-text-faint)',
  margin: '0 0 var(--space-lg)',
};

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 400,
  fontSize: '26px',
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-xs)',
};

const subStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-muted)',
  margin: '0 0 var(--space-2xl)',
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-md)',
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

const fieldErrStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  color: 'var(--color-danger)',
  marginTop: 'var(--space-xs)',
};

const hintStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  color: 'var(--color-text-faint)',
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

const submitBtnStyle: React.CSSProperties = {
  width: '100%',
  height: '48px',
  background: 'var(--color-accent)',
  color: '#ffffff',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '15px',
  cursor: 'pointer',
  transition: 'opacity 0.15s ease',
};

const bankSkipBoxStyle: React.CSSProperties = {
  background: 'var(--color-accent-soft)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  padding: 'var(--space-md)',
  marginTop: 'var(--space-md)',
};

const spinnerStyle: React.CSSProperties = {
  width: '24px',
  height: '24px',
  border: '3px solid var(--color-border)',
  borderTop: '3px solid var(--color-accent)',
  borderRadius: '50%',
  display: 'inline-block',
  animation: 'k-spin 0.7s linear infinite',
};
