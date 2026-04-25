import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTagsByUser } from '@/lib/actions/tag.actions';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import GiftTagsRow from '@/components/dashboard/GiftTagsRow';
import StatCards from '@/components/dashboard/StatCards';
import RecentGifts from '@/components/dashboard/RecentGifts';
import type { Contribution, Currency } from '@/types';

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect('/login');

  const userId = session.user.id;

  // All data fetched in parallel
  const [
    { data: profile },
    { data: directGiftsData },
    { data: poolGiftsData },
    { count: totalCount },
    { data: recentData },
    tags,
    { count: activePoolsCount },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('currency, display_name, username, avatar_url')
      .eq('id', userId)
      .single(),

    supabase
      .from('contributions')
      .select('gift_amount')
      .eq('recipient_id', userId)
      .eq('status', 'confirmed')
      .is('pool_id', null),

    supabase
      .from('contributions')
      .select('gift_amount')
      .eq('recipient_id', userId)
      .eq('status', 'confirmed')
      .not('pool_id', 'is', null),

    supabase
      .from('contributions')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('status', 'confirmed'),

    supabase
      .from('contributions')
      .select('*, tag:gift_tags!tag_id(*)')
      .eq('recipient_id', userId)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })
      .limit(5),

    getTagsByUser(userId),

    supabase
      .from('support_pools')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'open'),
  ]);

  const currency     = (profile?.currency ?? 'NGN') as Currency;
  const displayName  = profile?.display_name ?? '';
  const username     = profile?.username ?? '';
  const avatarUrl    = profile?.avatar_url ?? null;

  const directTotal  = (directGiftsData ?? []).reduce((s, r) => s + Number(r.gift_amount), 0);
  const poolTotal    = (poolGiftsData   ?? []).reduce((s, r) => s + Number(r.gift_amount), 0);
  const giftCount    = totalCount ?? 0;
  const activePools  = activePoolsCount ?? 0;
  const contributions = (recentData ?? []) as Contribution[];

  return (
    <>
      {/* Desktop page title — hidden on mobile */}
      <h1 className="k-dash-page-title">Dashboard</h1>

      {/* Profile header — hidden on desktop (sidebar handles nav context) */}
      <div className="k-dash-header-mobile">
        <DashboardHeader
          avatarUrl={avatarUrl}
          displayName={displayName}
          username={username}
        />
      </div>

      <GiftTagsRow tags={tags} userId={userId} currency={currency} />

      <StatCards
        directTotal={directTotal}
        poolTotal={poolTotal}
        giftCount={giftCount}
        activePools={activePools}
        currency={currency}
      />

      <RecentGifts contributions={contributions} currency={currency} />
    </>
  );
}
