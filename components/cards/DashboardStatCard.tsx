interface DashboardStatCardProps {
  label: string;
  value: string;
  sub: string;
}

export default function DashboardStatCard({ label, value, sub }: DashboardStatCardProps) {
  return (
    <div style={cardStyle}>
      <p style={labelStyle}>{label}</p>
      <p style={valueStyle}>{value}</p>
      <p style={subStyle}>{sub}</p>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--shadow-card)',
  padding: 'var(--space-lg)',   // compact — 24px per Section 3.3
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--color-text-faint)',
  margin: '0 0 var(--space-xs)',
};

const valueStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '28px',
  color: 'var(--color-text-primary)',
  margin: '0 0 2px',
  lineHeight: 1.1,
};

const subStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 400,
  fontSize: '13px',
  color: 'var(--color-text-muted)',
  margin: 0,
};
