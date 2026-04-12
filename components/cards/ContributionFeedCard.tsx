import ContributionRow from '@/components/shared/ContributionRow';
import type { Contribution } from '@/types';

interface ContributionFeedCardProps {
  contributions: Contribution[];
}

export default function ContributionFeedCard({ contributions }: ContributionFeedCardProps) {
  const recent = contributions.slice(0, 10);

  return (
    <div style={cardStyle}>
      <h2 style={headingStyle}>Recent gifts</h2>

      {recent.length === 0 ? (
        <p style={emptyStyle}>No gifts yet — be the first to show love ❤️</p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {recent.map((contribution, index) => (
            <ContributionRow
              key={contribution.id}
              contribution={contribution}
              isLast={index === recent.length - 1}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--shadow-card)',
  padding: 'var(--space-xl)',
};

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '16px',
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-sm)',
};

const emptyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-muted)',
  margin: 0,
  padding: 'var(--space-md) 0',
};
