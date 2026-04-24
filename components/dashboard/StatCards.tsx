import { formatCurrency } from '@/lib/utils/currency';
import type { Currency } from '@/types';

interface Props {
  directTotal: number;
  poolTotal: number;
  giftCount: number;
  activePools: number;
  currency: Currency;
}

export default function StatCards({
  directTotal,
  poolTotal,
  giftCount,
  activePools,
  currency,
}: Props) {
  const totalEarned = directTotal + poolTotal;

  return (
    <div style={rowStyle}>
      <div style={cardStyle}>
        <span style={labelStyle}>Gifts received</span>
        <span style={valueStyle}>{formatCurrency(directTotal, currency)}</span>
        <span style={subStyle}>
          {giftCount} gift{giftCount !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={cardStyle}>
        <span style={labelStyle}>Pool support</span>
        <span style={valueStyle}>{formatCurrency(poolTotal, currency)}</span>
        <span style={subStyle}>
          {activePools} pool{activePools !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={cardStyle}>
        <span style={labelStyle}>Total earned</span>
        <span style={valueStyle}>{formatCurrency(totalEarned, currency)}</span>
        <span style={subStyle}>All time</span>
      </div>
    </div>
  );
}

const rowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '8px',
  marginBottom: 'var(--space-md)',
};

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--shadow-card)',
  padding: '14px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  minWidth: 0,
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--color-text-faint)',
  lineHeight: 1.3,
};

const valueStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 600,
  fontSize: '19px',
  color: 'var(--color-text-primary)',
  lineHeight: 1.1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const subStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '11px',
  color: 'var(--color-text-muted)',
  lineHeight: 1.3,
};
