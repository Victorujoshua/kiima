// Platform-level stat card for admin overview.
// More compact than DashboardStatCard — suited for dense admin layout.

interface AdminStatCardProps {
  label: string;
  value: string;
  sub?: string;
}

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--shadow-card)',
  padding: '20px 24px',
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--color-text-faint)',
  marginBottom: '6px',
};

const valueStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '26px',
  fontWeight: 700,
  color: 'var(--color-text-primary)',
  lineHeight: 1.1,
};

const subStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--color-text-muted)',
  marginTop: '4px',
};

export default function AdminStatCard({ label, value, sub }: AdminStatCardProps) {
  return (
    <div style={cardStyle}>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{value}</div>
      {sub && <div style={subStyle}>{sub}</div>}
    </div>
  );
}
