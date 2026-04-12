export default function CreatorNotFound() {
  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <p style={emojiStyle}>🌿</p>
        <h1 style={headingStyle}>Creator not found</h1>
        <p style={bodyStyle}>
          This link doesn&apos;t match any creator on Kiima. Check the URL and try again.
        </p>
        <a href="/" style={linkStyle}>
          Go home
        </a>
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
  padding: 'var(--space-xl)',
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
  lineHeight: 1.65,
  color: 'var(--color-text-secondary)',
  margin: '0 0 var(--space-lg)',
};

const linkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '14px',
  color: 'var(--color-accent)',
  textDecoration: 'none',
};
