// Skeleton shown while dashboard/page.tsx fetches data (Next.js Suspense boundary)
export default function DashboardLoading() {
  return (
    <div style={pageStyle}>
      {/* Header skeleton */}
      <div style={headerStyle}>
        <div className="k-skeleton" style={{ width: 120, height: 28, marginBottom: 8 }} />
        <div className="k-skeleton" style={{ width: 180, height: 16 }} />
      </div>

      {/* Stat cards skeleton */}
      <div style={statsGridStyle}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={cardStyle}>
            <div className="k-skeleton" style={{ width: 70, height: 11, marginBottom: 10 }} />
            <div className="k-skeleton" style={{ width: 110, height: 28, marginBottom: 6 }} />
            <div className="k-skeleton" style={{ width: 60, height: 13 }} />
          </div>
        ))}
      </div>

      {/* Recent gifts card skeleton */}
      <div style={cardStyle}>
        <div className="k-skeleton" style={{ width: 100, height: 16, marginBottom: 20 }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={rowStyle}>
            <div className="k-skeleton" style={{ flex: 1, height: 14, maxWidth: 260 }} />
            <div className="k-skeleton" style={{ width: 60, height: 12 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  maxWidth: '900px',
  margin: '0 auto',
  padding: '40px 0',
};

const headerStyle: React.CSSProperties = {
  marginBottom: 'var(--space-xl)',
};

const statsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '16px',
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
