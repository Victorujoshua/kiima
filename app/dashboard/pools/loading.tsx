// Skeleton shown while pools/page.tsx fetches data
export default function PoolsLoading() {
  return (
    <div style={pageStyle}>
      {/* Header skeleton */}
      <div style={headerStyle}>
        <div>
          <div className="k-skeleton" style={{ width: 130, height: 20, marginBottom: 8 }} />
          <div className="k-skeleton" style={{ width: 280, height: 14 }} />
        </div>
        <div className="k-skeleton" style={{ width: 120, height: 40, borderRadius: 100 }} />
      </div>

      {/* Pool cards skeleton */}
      <div style={listStyle}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={poolCardStyle}>
            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 6 }}>
              <div className="k-skeleton" style={{ flex: 1, height: 16, maxWidth: 200 }} />
              <div className="k-skeleton" style={{ width: 52, height: 20, borderRadius: 100 }} />
            </div>
            {/* URL */}
            <div className="k-skeleton" style={{ width: 220, height: 12, marginBottom: 16 }} />
            {/* Progress bar */}
            <div className="k-skeleton" style={{ width: '100%', height: 8, borderRadius: 100, marginBottom: 8 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="k-skeleton" style={{ width: 140, height: 12 }} />
              <div className="k-skeleton" style={{ width: 40, height: 12 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  padding: 'var(--space-xl) 0',
  maxWidth: '800px',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 'var(--space-md)',
  marginBottom: 'var(--space-xl)',
  flexWrap: 'wrap' as const,
};

const listStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-md)',
};

const poolCardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--shadow-card)',
  padding: 'var(--space-lg)',
};
