import Link from 'next/link';

interface Props {
  searchParams: { from?: string };  // optional creator username passed in URL
}

export default function GiftCancelledPage({ searchParams }: Props) {
  const from = searchParams.from ?? null;

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <p style={emojiStyle}>💛</p>

        <h1 style={headingStyle}>Payment didn&apos;t go through</h1>

        <p style={bodyStyle}>
          No worries — nothing was charged. You can try again whenever you&apos;re ready.
        </p>

        {from ? (
          <Link href={`/${from}`} style={backLinkStyle}>
            ← Try again
          </Link>
        ) : (
          <Link href="/" style={backLinkStyle}>
            ← Go home
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  maxWidth: '440px',
  width: '100%',
  textAlign: 'center',
};

const emojiStyle: React.CSSProperties = {
  fontSize: '48px',
  margin: '0 0 var(--space-md)',
  lineHeight: 1,
};

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 500,
  fontSize: '26px',
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-sm)',
  lineHeight: 1.25,
};

const bodyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 400,
  fontSize: '14px',
  lineHeight: 1.65,
  color: 'var(--color-text-secondary)',
  margin: '0 0 var(--space-xl)',
};

const backLinkStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontWeight: 500,
  fontSize: '14px',
  color: 'var(--color-accent)',
  textDecoration: 'none',
};
