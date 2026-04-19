'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <p style={emojiStyle}>🌧️</p>
        <h1 style={headingStyle}>Something went wrong</h1>
        <p style={bodyStyle}>
          Try refreshing — if the problem keeps happening, come back in a moment.
        </p>
        <button onClick={reset} style={btnStyle}>
          Try again
        </button>
      </div>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px',
};

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--shadow-card)',
  padding: 'var(--space-2xl)',
  maxWidth: '420px',
  width: '100%',
  textAlign: 'center',
};

const emojiStyle: React.CSSProperties = {
  fontSize: '40px',
  margin: '0 0 var(--space-md)',
};

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 500,
  fontSize: '24px',
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-sm)',
};

const bodyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-secondary)',
  lineHeight: 1.65,
  margin: '0 0 var(--space-lg)',
};

const btnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '14px',
  color: '#ffffff',
  background: 'var(--color-text-primary)',
  border: 'none',
  borderRadius: 'var(--radius-full)',
  padding: '10px var(--space-xl)',
  cursor: 'pointer',
  boxShadow: 'var(--shadow-btn)',
};
