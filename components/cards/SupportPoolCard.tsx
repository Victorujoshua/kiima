import ProgressBar from '@/components/shared/ProgressBar';
import type { SupportPool, Currency } from '@/types';

interface SupportPoolCardProps {
  pool: SupportPool;
  currency: Currency;
  creatorName?: string;
  contributorCount?: number;
}

export default function SupportPoolCard({
  pool,
  currency,
  creatorName,
  contributorCount,
}: SupportPoolCardProps) {
  const isClosed = pool.status === 'closed';

  return (
    <div style={cardStyle}>
      {/* Closed banner */}
      {isClosed && (
        <div style={closedBannerStyle}>
          This support pool is closed 🔒
        </div>
      )}

      {/* Header row — title + badge */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>{pool.title}</h1>
        <span style={{ ...badgeStyle, ...(isClosed ? closedBadgeStyle : openBadgeStyle) }}>
          {isClosed ? 'Closed' : 'Open'}
        </span>
      </div>

      {/* Creator byline */}
      {creatorName && (
        <p style={bylineStyle}>by {creatorName}</p>
      )}

      {/* Description */}
      {pool.description && (
        <p style={descStyle}>{pool.description}</p>
      )}

      {/* Progress */}
      <div style={{ marginTop: 'var(--space-md)' }}>
        <ProgressBar raised={pool.raised} goal={pool.goal_amount} currency={currency} />
      </div>

      {/* Footer — contributor count */}
      {contributorCount !== undefined && (
        <p style={footerStyle}>
          {contributorCount === 0
            ? 'No contributions yet — be the first!'
            : `${contributorCount} ${contributorCount === 1 ? 'person' : 'people'} contributed`}
        </p>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--shadow-card)',
  padding: 'var(--space-xl)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-sm)',
};

const closedBannerStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  fontWeight: 500,
  color: 'var(--color-text-muted)',
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: '10px var(--space-md)',
  textAlign: 'center',
  marginBottom: 'var(--space-xs)',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 'var(--space-sm)',
  flexWrap: 'wrap',
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 500,
  fontSize: '22px',
  color: 'var(--color-text-primary)',
  margin: 0,
  flex: 1,
  minWidth: 0,
  lineHeight: 1.25,
};

const badgeStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '11px',
  borderRadius: 'var(--radius-full)',
  padding: '4px 12px',
  flexShrink: 0,
  alignSelf: 'flex-start',
  marginTop: '4px',
};

const openBadgeStyle: React.CSSProperties = {
  background: 'var(--color-success-soft)',
  color: 'var(--color-success)',
};

const closedBadgeStyle: React.CSSProperties = {
  background: 'var(--color-bg)',
  color: 'var(--color-text-muted)',
};

const bylineStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--color-text-muted)',
  margin: 0,
};

const descStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-secondary)',
  lineHeight: 1.65,
  margin: 0,
};

const footerStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  color: 'var(--color-text-muted)',
  margin: '0',
  paddingTop: 'var(--space-xs)',
  borderTop: '1px solid var(--color-border)',
};
