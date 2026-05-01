import { formatContributionLine, parseSocialHandle } from '@/lib/utils/display-name';
import { PlatformIcon } from '@/components/shared/SocialHandleInput';
import type { Contribution } from '@/types';

interface ContributionRowProps {
  contribution: Contribution;
  isLast?: boolean;
  source?: string; // e.g. pool title or "Direct gift" — shown as a small badge
}

export default function ContributionRow({ contribution, isLast = false, source }: ContributionRowProps) {
  const line = formatContributionLine(contribution);

  const date = new Date(contribution.created_at).toLocaleDateString('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <li
      style={{
        ...rowStyle,
        borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
      }}
    >
      <div style={{ minWidth: 0 }}>
        {(() => {
          const social = !contribution.is_anonymous ? parseSocialHandle(contribution.display_name) : null;
          if (social) {
            const amount = formatContributionLine(contribution).split(' sent ')[1] ?? '';
            return (
              <span style={{ ...lineStyle, display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                <PlatformIcon platform={social.platform} />
                <span style={{ color: 'var(--color-text-faint)', flexShrink: 0 }}>|</span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', flexShrink: 0 }}>{social.handle}</span>
                <span style={{ flexShrink: 0 }}>sent {amount}</span>
              </span>
            );
          }
          return <span style={lineStyle}>{line}</span>;
        })()}
        {source && <span style={sourceStyle}>{source}</span>}
      </div>
      <span style={dateStyle}>{date}</span>
    </li>
  );
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--space-md)',
  padding: 'var(--space-sm) 0',
};

const lineStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-secondary)',
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const sourceStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '11px',
  color: 'var(--color-text-faint)',
  display: 'block',
  marginTop: '2px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const dateStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  color: 'var(--color-text-faint)',
  flexShrink: 0,
};
