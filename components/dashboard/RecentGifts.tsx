import Link from 'next/link';
import { formatCurrency } from '@/lib/utils/currency';
import { resolveDisplayName, parseSocialHandle } from '@/lib/utils/display-name';
import { PlatformIcon } from '@/components/shared/SocialHandleInput';
import type { Contribution, Currency } from '@/types';

interface Props {
  contributions: Contribution[];
  currency:      Currency;
  creatorName:   string;
}

function relativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

const AVATAR_COLORS = ['#FFF5EB', '#F5F5CC', '#FFF0EB', '#F5F5CC', '#FFF5EB'];
const AVATAR_TEXT   = ['#FF5C00', '#8A8A00', '#FF5C00', '#8A8A00', '#FF5C00'];

export default function RecentGifts({ contributions, currency, creatorName }: Props) {
  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <span style={headingStyle}>Recent supporters</span>
        <Link href="/dashboard/transactions" style={seeAllStyle}>See all →</Link>
      </div>

      {contributions.length === 0 ? (
        <div style={emptyStyle}>
          <span style={{ fontSize: 36, display: 'block', marginBottom: 10 }}>🥤</span>
          <p style={emptyTextStyle}>No supporters yet</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#B5AAAA', margin: '4px 0 0' }}>
            Share your page to receive your first gift
          </p>
        </div>
      ) : (
        <div>
          {contributions.map((c, i) => {
            const name     = resolveDisplayName(c.display_name, c.is_anonymous);
            const isAnon   = name === 'Anonymous';
            const tagLabel = c.tag_label ?? 'Custom amount';
            const isLast   = i === contributions.length - 1;
            const social   = !c.is_anonymous ? parseSocialHandle(c.display_name) : null;
            const initial  = isAnon ? '🥤' : name.charAt(0).toUpperCase();
            const bg       = AVATAR_COLORS[i % AVATAR_COLORS.length];
            const fg       = AVATAR_TEXT[i % AVATAR_TEXT.length];

            return (
              <div
                key={c.id}
                style={{
                  display:       'flex',
                  alignItems:    'center',
                  gap:           12,
                  paddingBottom: isLast ? 0 : 14,
                  marginBottom:  isLast ? 0 : 14,
                  borderBottom:  isLast ? 'none' : '1px solid #F2EDE7',
                }}
              >
                {/* Avatar */}
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {isAnon
                    ? <span style={{ fontSize: 16, lineHeight: 1 }}>🥤</span>
                    : <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, color: fg, lineHeight: 1 }}>{initial}</span>
                  }
                </div>

                {/* Name + tag */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {social ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden' }}>
                      <PlatformIcon platform={social.platform} />
                      <span style={nameStyle}>{social.handle}</span>
                    </div>
                  ) : (
                    <p style={nameStyle}>{name}</p>
                  )}
                  <p style={tagStyle}>{tagLabel}</p>
                </div>

                {/* Amount + time */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                  <span style={amountStyle}>{formatCurrency(Number(c.gift_amount), currency)}</span>
                  <span style={timeStyle}>{relativeTime(c.created_at)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background:   '#ffffff',
  borderRadius: 16,
  border:       '1px solid #EBEBEB',
  padding:      28,
  marginTop:    16,
};

const headerStyle: React.CSSProperties = {
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'space-between',
  marginBottom:   20,
};

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize:   16,
  color:      '#1C1916',
};

const seeAllStyle: React.CSSProperties = {
  fontFamily:     'var(--font-body)',
  fontSize:       13,
  fontWeight:     600,
  color:          '#FF5C00',
  textDecoration: 'none',
};

const emptyStyle: React.CSSProperties = {
  textAlign: 'center',
  padding:   '24px 0',
};

const emptyTextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize:   15,
  color:      '#5A4D44',
  margin:     0,
};

const nameStyle: React.CSSProperties = {
  fontFamily:    'var(--font-body)',
  fontWeight:    600,
  fontSize:      14,
  color:         '#1C1916',
  margin:        0,
  overflow:      'hidden',
  textOverflow:  'ellipsis',
  whiteSpace:    'nowrap',
};

const tagStyle: React.CSSProperties = {
  fontFamily:   'var(--font-body)',
  fontSize:     12,
  color:        '#9A9089',
  margin:       '2px 0 0',
  overflow:     'hidden',
  textOverflow: 'ellipsis',
  whiteSpace:   'nowrap',
};

const amountStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize:   14,
  color:      '#1C1916',
};

const timeStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize:   12,
  color:      '#B5AAAA',
};
