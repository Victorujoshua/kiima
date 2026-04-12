import { formatContributionLine } from '@/lib/utils/display-name';
import type { Contribution } from '@/types';

interface ContributionRowProps {
  contribution: Contribution;
  isLast?: boolean;
}

export default function ContributionRow({ contribution, isLast = false }: ContributionRowProps) {
  const line = formatContributionLine(contribution);

  const date = new Date(contribution.created_at).toLocaleDateString('en', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <li
      style={{
        ...rowStyle,
        borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
      }}
    >
      <span style={lineStyle}>{line}</span>
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
