// Skeleton shown while tags/page.tsx fetches data
export default function TagsLoading() {
  return (
    <div style={pageStyle}>
      {/* Header skeleton */}
      <div style={headerStyle}>
        <div className="k-skeleton" style={{ width: 100, height: 20, marginBottom: 8 }} />
        <div className="k-skeleton" style={{ width: 260, height: 14 }} />
      </div>

      {/* Tags card skeleton */}
      <div style={cardStyle}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={rowStyle}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="k-skeleton" style={{ width: `${40 + (i * 23) % 35}%`, height: 14, marginBottom: 4 }} />
              <div className="k-skeleton" style={{ width: 60, height: 12 }} />
            </div>
            <div className="k-skeleton" style={{ width: 64, height: 28, borderRadius: 100 }} />
          </div>
        ))}

        {/* Add tag button skeleton */}
        <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-border)' }}>
          <div className="k-skeleton" style={{ width: 120, height: 14 }} />
        </div>
      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  maxWidth: '640px',
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
