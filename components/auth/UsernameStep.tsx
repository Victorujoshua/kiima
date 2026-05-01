'use client';

import { useState, useRef } from 'react';
import { checkUsernameAvailable } from '@/lib/actions/auth.actions';

type Status = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

interface Props {
  onNext: (username: string) => void;
}

export default function UsernameStep({ onNext }: Props) {
  const [username, setUsername] = useState('');
  const [status, setStatus]     = useState<Status>('idle');
  const [msg, setMsg]           = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const cleaned = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleaned);
    setStatus('idle');
    setMsg('');

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!cleaned || cleaned.length < 3) {
      if (cleaned && cleaned.length < 3) {
        setStatus('invalid');
        setMsg('At least 3 characters required.');
      }
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setStatus('checking');
      const result = await checkUsernameAvailable(cleaned);
      if (result.error) {
        setStatus('invalid');
        setMsg(result.error);
      } else if (result.available) {
        setStatus('available');
        setMsg(`kiima.app/${cleaned} is available`);
      } else {
        setStatus('taken');
        setMsg('This username is taken');
      }
    }, 500);
  }

  const canProceed = status === 'available';

  return (
    <>
      <div style={{ paddingBottom: 100 }}>
        <h1 style={headingStyle}>Create your account</h1>
        <p style={subStyle}>Choose a username for your page.</p>

        {/* Pill input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: '#f3f3f3',
          borderRadius: 100,
          padding: '16px 24px',
          border: `2px solid ${status === 'taken' || status === 'invalid' ? '#E07070' : status === 'available' ? '#3D9B56' : 'transparent'}`,
          transition: 'border-color 0.15s ease',
        }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 18, color: '#9A9089', flexShrink: 0, userSelect: 'none' }}>
            kiima.app/
          </span>
          <input
            value={username}
            onChange={handleChange}
            placeholder="yourname"
            autoFocus
            autoComplete="username"
            maxLength={30}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 18,
              fontWeight: 600,
              color: '#1C1916',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              flex: 1,
              minWidth: 0,
            }}
          />
          {status === 'checking' && <Spinner />}
          {status === 'available' && <span style={{ color: '#3D9B56', fontSize: 18 }}>✓</span>}
        </div>

        {/* Status message */}
        <div style={{ marginTop: 12, minHeight: 20 }}>
          {status === 'available' && (
            <p style={{ ...statusStyle, color: '#3D9B56' }}>✓ {msg}</p>
          )}
          {(status === 'taken' || status === 'invalid') && (
            <p style={{ ...statusStyle, color: '#E07070' }}>✗ {msg}</p>
          )}
        </div>
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
            onClick={() => canProceed && onNext(username)}
            disabled={!canProceed}
            style={{ ...ctaBtnStyle, opacity: canProceed ? 1 : 0.35, cursor: canProceed ? 'pointer' : 'not-allowed' }}
          >
            Sign up
          </button>
        </div>
      </div>
    </>
  );
}

function Spinner() {
  return (
    <span style={{
      width: 16, height: 16,
      border: '2px solid #e0e0e0',
      borderTop: '2px solid #9A9089',
      borderRadius: '50%',
      display: 'inline-block',
      animation: 'k-spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
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
  margin: '0 0 32px',
};

const statusStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  margin: 0,
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
