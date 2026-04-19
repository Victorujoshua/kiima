import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardStatCard from '@/components/cards/DashboardStatCard';
import ContributionRow from '@/components/shared/ContributionRow';
import { formatCurrency } from '@/lib/utils/currency';
import type { Contribution, Currency } from '@/types';

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect('/login');

  const userId = session.user.id;

  // Profile for currency
  const { data: profile } = await supabase
    .from('profiles')
    .select('currency, display_name')
    .eq('id', userId)
    .single();

  const currency = (profile?.currency ?? 'NGN') as Currency;

  // All four queries run in parallel
  const [
    { data: directGiftsData },
    { data: poolGiftsData },
    { count: totalCount },
    { data: recentData },
  ] = await Promise.all([
    // Direct gift net amounts (pool_id IS NULL) — creator sees what they received
    supabase
      .from('contributions')
      .select('creator_amount')
      .eq('recipient_id', userId)
      .eq('status', 'confirmed')
      .is('pool_id', null),

    // Pool contribution net amounts (pool_id IS NOT NULL)
    supabase
      .from('contributions')
      .select('creator_amount')
      .eq('recipient_id', userId)
      .eq('status', 'confirmed')
      .not('pool_id', 'is', null),

    // Total confirmed count
    supabase
      .from('contributions')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('status', 'confirmed'),

    // 5 most recent — with tag join for formatContributionLine
    supabase
      .from('contributions')
      .select('*, tag:gift_tags!tag_id(*)')
      .eq('recipient_id', userId)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const totalDirectGifts = (directGiftsData ?? []).reduce(
    (sum, r) => sum + Number(r.creator_amount), 0
  );
  const totalPoolGifts = (poolGiftsData ?? []).reduce(
    (sum, r) => sum + Number(r.creator_amount), 0
  );
  const giftCount     = totalCount ?? 0;
  const contributions = (recentData ?? []) as Contribution[];

  return (
    <div style={pageStyle}>
      {/* Page header */}
      <div style={headerStyle}>
        <h1 style={headingStyle}>Overview</h1>
        <p style={subtitleStyle}>
          Welcome back{profile?.display_name ? `, ${profile.display_name.split(' ')[0]}` : ''} 👋
        </p>
      </div>

      {/* Stat cards */}
      <div style={statsGridStyle}>
        <DashboardStatCard
          label="Gifts received"
          value={formatCurrency(totalDirectGifts, currency)}
          sub="direct gifts"
        />
        <DashboardStatCard
          label="Pool support"
          value={formatCurrency(totalPoolGifts, currency)}
          sub="from pools"
        />
        <DashboardStatCard
          label="Total gifts"
          value={giftCount.toString()}
          sub="all time"
        />
      </div>

      {/* Recent contributions */}
      <div style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>Recent gifts</h2>
        <div style={feedCardStyle}>
          {contributions.length === 0 ? (
            <p style={emptyStyle}>
              No gifts yet — share your gift link to get started!
            </p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {contributions.map((c, i) => (
                <ContributionRow
                  key={c.id}
                  contribution={c}
                  isLast={i === contributions.length - 1}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  maxWidth: '900px',
  margin: '0 auto',
  padding: '40px 0',
};

const headerStyle: React.CSSProperties = {
  marginBottom: 'var(--space-xl)',
};

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 500,
  fontSize: '28px',
  color: 'var(--color-text-primary)',
  margin: 0,
};

const subtitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-secondary)',
  margin: 'var(--space-xs) 0 0',
};

const statsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '16px',
  marginBottom: 'var(--space-xl)',
};

const sectionStyle: React.CSSProperties = {
  marginTop: 'var(--space-xl)',
};

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '16px',
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-md)',
};

const feedCardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--shadow-card)',
  padding: 'var(--space-xl)',
};

const emptyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-muted)',
  margin: 0,
  padding: 'var(--space-md) 0',
};
