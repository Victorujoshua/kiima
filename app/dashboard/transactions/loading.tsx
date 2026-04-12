// Skeleton shown while transactions/page.tsx fetches data
export default function TransactionsLoading() {
  return (
    <div style={pageStyle}>
      {/* Header skeleton */}
      <div style={headerStyle}>
        <div className="k-skeleton" style={{ width: 90, height: 20, marginBottom: 8 }} />
        <div className="k-skeleton" style={{ width: 240, height: 14 }} />
      </div>

      {/* Contributions card skeleton */}
      <div style={cardStyle}>
        <div className="k-skeleton" style={{ width: 100, height: 11, marginBottom: 20 }} />
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} style={rowStyle}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="k-skeleton" style={{ width: `${50 + (i * 17) % 40}%`, height: 14, marginBottom: 4 }} />
              <div className="k-skeleton" style={{ width: 80, height: 11 }} />
            </div>
            <div className="k-skeleton" style={{ width: 70, height: 12, flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  maxWidth: '800px',
  padding: 'var(--space-xl) 0',
};

const headerStyle: React.CSSProperties = {
  marginBottom: 'var(--space-xl)',
};

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--shadow-card)',
  padding: 'var(--space-xl)',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 'var(--space-md)',
  padding: 'var(--space-sm) 0',
  borderBottom: '1px solid var(--color-border)',
};
