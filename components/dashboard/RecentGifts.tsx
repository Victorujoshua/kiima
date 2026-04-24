import Link from 'next/link';
import { formatCurrency } from '@/lib/utils/currency';
import { resolveDisplayName } from '@/lib/utils/display-name';
import type { Contribution, Currency } from '@/types';

interface Props {
  contributions: Contribution[];
  currency: Currency;
}

function relativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Soft avatar background colours — rotate by index
const AVATAR_BG = [
  'var(--color-accent-soft)',
  'var(--color-success-soft)',
  '#F0F0FD',
  '#FFF9EC',
  '#FDF0F0',
];

export default function RecentGifts({ contributions, currency }: Props) {
  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <h2 style={headingStyle}>Recent gifts</h2>
        <Link href="/dashboard/transactions" style={seeAllStyle}>
          See all →
        </Link>
      </div>

      {contributions.length === 0 ? (
        <div style={emptyStyle}>
          <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>
            🥤
          </span>
          <p style={emptyTextStyle}>
            No gifts yet — share your link to get started
          </p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {contributions.map((c, i) => {
            const name     = resolveDisplayName(c.display_name, c.is_anonymous);
            const isAnon   = name === 'Anonymous';
            const initial  = isAnon ? '🥤' : name.charAt(0).toUpperCase();
            const tagLabel = c.tag?.label ?? 'Custom amount';
            const bg       = AVATAR_BG[i % AVATAR_BG.length];
            const isLast   = i === contributions.length - 1;

            return (
              <li
                key={c.id}
                style={{
                  ...rowStyle,
                  borderBottom: isLast ? 'none' : '1px solid #F2EDE7',
                  paddingBottom: isLast ? 0 : '14px',
                  marginBottom: isLast ? 0 : '14px',
                }}
              >
                {/* Avatar */}
                <div style={{ ...avatarStyle, background: bg }}>
                  {isAnon ? (
                    <span style={{ fontSize: '16px', lineHeight: 1 }}>{initial}</span>
                  ) : (
                    <span style={avatarTextStyle}>{initial}</span>
                  )}
                </div>

                {/* Info */}
                <div style={infoStyle}>
                  <span style={nameStyle}>{name}</span>
                  <span style={tagLabelStyle}>{tagLabel}</span>
                  <span style={timeStyle}>{relativeTime(c.created_at)}</span>
                </div>

                {/* Amount */}
                <div style={amountColStyle}>
                  <span style={giftAmountStyle}>
                    {formatCurrency(Number(c.gift_amount), currency)}
                  </span>
                  <span style={creatorAmountStyle}>
                    → {formatCurrency(Number(c.creator_amount), currency)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
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
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 'var(--space-md)',
};

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 500,
  fontSize: '18px',
  color: 'var(--color-text-primary)',
  margin: 0,
};

const seeAllStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '13px',
  color: 'var(--color-accent)',
  textDecoration: 'none',
};

const emptyStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: 'var(--space-xl) 0',
};

const emptyTextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-muted)',
  margin: 0,
  lineHeight: 1.65,
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const avatarStyle: React.CSSProperties = {
  width: '38px',
  height: '38px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const avatarTextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '15px',
  color: 'var(--color-text-secondary)',
  lineHeight: 1,
};

const infoStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  minWidth: 0,
};

const nameStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '14px',
  color: 'var(--color-text-primary)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const tagLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  color: 'var(--color-text-muted)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const timeStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '11px',
  color: 'var(--color-text-faint)',
};

const amountColStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: '2px',
  flexShrink: 0,
};

const giftAmountStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '14px',
  color: 'var(--color-text-primary)',
};

const creatorAmountStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '11px',
  color: 'var(--color-text-muted)',
};
