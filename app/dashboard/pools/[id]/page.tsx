import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import ProgressBar from '@/components/shared/ProgressBar';
import ClosePoolButton from './ClosePoolButton';
import ShowContributorsToggle from './ShowContributorsToggle';
import { formatCurrency } from '@/lib/utils/currency';
import { formatContributionLine } from '@/lib/utils/display-name';
import type { Contribution, Currency, SupportPool } from '@/types';

interface PageProps {
  params: { id: string };
}

export default async function PoolDetailPage({ params }: PageProps) {
  const supabase = createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  // Fetch pool — ownership check built into the query (user_id must match)
  const { data: poolData } = await supabase
    .from('support_pools')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .single();

  // Not found or not the owner → back to pools list
  if (!poolData) redirect('/dashboard/pools');
  const pool = poolData as SupportPool;

  // Fetch currency + all contributions for this pool in parallel
  const [profileResult, contribResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('currency')
      .eq('id', session.user.id)
      .single(),
    supabase
      .from('contributions')
      .select('*')
      .eq('pool_id', pool.id)
      .order('created_at', { ascending: false }),
  ]);

  const currency = (profileResult.data?.currency ?? 'NGN') as Currency;
  const contributions = (contribResult.data ?? []) as Contribution[];
  const confirmedCount = contributions.filter((c) => c.status === 'confirmed').length;
  const isClosed = pool.status === 'closed';

  return (
    <div style={pageStyle}>
      {/* Back navigation */}
      <Link href="/dashboard/pools" style={backLinkStyle}>
        ← All pools
      </Link>

      {/* Pool header card */}
      <div style={cardStyle}>
        {/* Title row */}
        <div style={titleRowStyle}>
          <h1 style={titleStyle}>{pool.title}</h1>
          <span style={{ ...badgeStyle, ...(isClosed ? closedBadgeStyle : openBadgeStyle) }}>
            {isClosed ? 'Closed' : 'Open'}
          </span>
        </div>

        {/* Description */}
        {pool.description && (
          <p style={descStyle}>{pool.description}</p>
        )}

        {/* Progress */}
        <div style={{ margin: 'var(--space-md) 0' }}>
          <ProgressBar raised={pool.raised} goal={pool.goal_amount} currency={currency} />
        </div>

        {/* Stats row */}
        <div style={statsRowStyle}>
          <div style={statStyle}>
            <span style={statLabelStyle}>Raised</span>
            <span style={statValueStyle}>{formatCurrency(pool.raised, currency)}</span>
          </div>
          <div style={statDivider} />
          <div style={statStyle}>
            <span style={statLabelStyle}>Goal</span>
            <span style={statValueStyle}>{formatCurrency(pool.goal_amount, currency)}</span>
          </div>
          <div style={statDivider} />
          <div style={statStyle}>
            <span style={statLabelStyle}>Contributors</span>
            <span style={statValueStyle}>{confirmedCount}</span>
          </div>
        </div>
      </div>

      {/* Pool settings */}
      <div style={cardStyle}>
        <h2 style={sectionHeadingStyle}>Settings</h2>
        <ShowContributorsToggle
          poolId={pool.id}
          userId={session.user.id}
          initialValue={pool.show_contributors}
        />
      </div>

      {/* Close pool action — only shown while pool is open */}
      {!isClosed && (
        <div style={dangerCardStyle}>
          <h2 style={dangerHeadingStyle}>Close this pool</h2>
          <ClosePoolButton poolId={pool.id} userId={session.user.id} />
        </div>
      )}

      {/* Closed notice */}
      {isClosed && (
        <div style={closedNoticeStyle}>
          🔒 This pool is closed. No new contributions can be made.
        </div>
      )}

      {/* Contributions card */}
      <div style={cardStyle}>
        <h2 style={sectionHeadingStyle}>
          All contributions{contributions.length > 0 ? ` (${contributions.length})` : ''}
        </h2>

        {contributions.length === 0 ? (
          <p style={emptyStyle}>No contributions yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {contributions.map((contribution, index) => {
              const line = formatContributionLine(contribution);
              const date = new Date(contribution.created_at).toLocaleDateString('en', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
              const isPending = contribution.status === 'pending';
              const isLast = index === contributions.length - 1;

              return (
                <li
                  key={contribution.id}
                  style={{
                    ...rowStyle,
                    borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
                    opacity: isPending ? 0.6 : 1,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <span style={rowLineStyle}>{line}</span>
                    {isPending && (
                      <span style={pendingBadgeStyle}>Pending</span>
                    )}
                  </div>
                  <span style={rowDateStyle}>{date}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

const backLinkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '13px',
  color: 'var(--color-accent)',
  textDecoration: 'none',
  display: 'inline-block',
  marginBottom: 'var(--space-xs)',
};

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: 16,
  border: '1px solid #EBEBEB',
  padding: 28,
};

const titleRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 'var(--space-sm)',
  flexWrap: 'wrap',
  marginBottom: 'var(--space-xs)',
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '20px',
  color: 'var(--color-text-primary)',
  margin: 0,
  flex: 1,
  minWidth: 0,
};

const badgeStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '11px',
  borderRadius: 100,
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

const descStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-secondary)',
  lineHeight: 1.65,
  margin: '0 0 var(--space-sm)',
};

const statsRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-md)',
  flexWrap: 'wrap',
};

const statStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
};

const statLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--color-text-faint)',
};

const statValueStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '16px',
  color: 'var(--color-text-primary)',
};

const statDivider: React.CSSProperties = {
  width: '1px',
  height: '32px',
  background: '#EBEBEB',
  flexShrink: 0,
};

const dangerCardStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: 16,
  border: '1px solid #EBEBEB',
  padding: 28,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

const dangerHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '14px',
  color: 'var(--color-text-secondary)',
  margin: 0,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const closedNoticeStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--color-text-muted)',
  background: '#F4F4F4',
  border: '1px solid #EBEBEB',
  borderRadius: 12,
  padding: '12px 16px',
};

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '15px',
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-md)',
};

const emptyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-muted)',
  margin: 0,
  padding: 'var(--space-md) 0',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--space-md)',
  padding: 'var(--space-sm) 0',
};

const rowLineStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-secondary)',
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const rowDateStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  color: 'var(--color-text-faint)',
  flexShrink: 0,
};

const pendingBadgeStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--color-text-muted)',
  background: 'var(--color-bg)',
  borderRadius: 'var(--radius-full)',
  padding: '2px 8px',
  marginLeft: 'var(--space-xs)',
  display: 'inline-block',
};
