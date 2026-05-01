import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getPools } from '@/lib/actions/pool.actions';
import ProgressBar from '@/components/shared/ProgressBar';
import PoolsClient from './PoolsClient';
import CopyPoolLink from './CopyPoolLink';
import { formatCurrency } from '@/lib/utils/currency';
import type { Currency } from '@/types';

export default async function PoolsPage() {
  const supabase = createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('currency, username')
    .eq('id', session.user.id)
    .single();

  const currency = (profile?.currency ?? 'NGN') as Currency;
  const username = profile?.username ?? '';
  const pools = await getPools(session.user.id);

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h1 className="k-dash-page-title">Support pools</h1>
          <p style={subStyle}>Create funding goals your supporters can chip in on together.</p>
        </div>
        <PoolsClient userId={session.user.id} currency={currency} />
      </div>

      {pools.length === 0 ? (
        <div style={emptyCardStyle}>
          <p style={emptyEmojiStyle}>🌱</p>
          <p style={emptyHeadingStyle}>You haven&apos;t created a pool yet — start one!</p>
          <p style={emptyBodyStyle}>
            Set a goal, share your pool link, and let your supporters chip in together.
          </p>
        </div>
      ) : (
        <div style={listStyle}>
          {pools.map((pool) => {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kiima.app';
            const poolUrl = `${appUrl}/${username}/pool/${pool.slug}`;
            const poolUrlDisplay = `kiima.app/${username}/pool/${pool.slug}`;

            return (
              <div key={pool.id} style={poolCardStyle}>
                <div style={poolHeaderStyle}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={poolTitleRowStyle}>
                      <span style={poolTitleStyle}>{pool.title}</span>
                      <span
                        style={{
                          ...badgeStyle,
                          ...(pool.status === 'open' ? openBadgeStyle : closedBadgeStyle),
                        }}
                      >
                        {pool.status === 'open' ? 'Open' : 'Closed'}
                      </span>
                    </div>
                    <CopyPoolLink url={poolUrl} display={poolUrlDisplay} />
                    {pool.description && (
                      <p style={poolDescStyle}>{pool.description}</p>
                    )}
                  </div>
                </div>

                <ProgressBar raised={pool.raised} goal={pool.goal_amount} currency={currency} />

                <div style={poolFooterStyle}>
                  <span style={raisedLabelStyle}>
                    {formatCurrency(pool.raised, currency)} raised of {formatCurrency(pool.goal_amount, currency)} goal
                  </span>
                  <Link
                    href={`/${username}/pool/${pool.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={viewLinkStyle}
                  >
                    View →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  padding: '0',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 'var(--space-md)',
  marginBottom: 'var(--space-xl)',
  flexWrap: 'wrap',
};

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '20px',
  color: 'var(--color-text-primary)',
  margin: '0 0 4px',
};

const subStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-secondary)',
  margin: 0,
};

const listStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-md)',
};

const poolCardStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: 16,
  border: '1px solid #EBEBEB',
  padding: 28,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

const poolHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 'var(--space-sm)',
};

const poolTitleRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-sm)',
  flexWrap: 'wrap',
  marginBottom: '4px',
};

const poolTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '16px',
  color: 'var(--color-text-primary)',
};

const poolDescStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--color-text-secondary)',
  margin: 0,
  lineHeight: 1.5,
};

const badgeStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '11px',
  borderRadius: 100,
  padding: '3px 10px',
  flexShrink: 0,
};

const openBadgeStyle: React.CSSProperties = {
  background: 'var(--color-success-soft)',
  color: 'var(--color-success)',
};

const closedBadgeStyle: React.CSSProperties = {
  background: 'var(--color-bg)',
  color: 'var(--color-text-muted)',
};

const poolFooterStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const raisedLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  color: 'var(--color-text-muted)',
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const viewLinkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '13px',
  color: 'var(--color-accent)',
  textDecoration: 'none',
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: '44px',
  paddingLeft: 'var(--space-md)',
};

const emptyCardStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: 16,
  border: '1px solid #EBEBEB',
  padding: 40,
  textAlign: 'center',
};

const emptyEmojiStyle: React.CSSProperties = {
  fontSize: '36px',
  margin: '0 0 var(--space-sm)',
};

const emptyHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '16px',
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-xs)',
};

const emptyBodyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-secondary)',
  margin: 0,
  lineHeight: 1.6,
};
