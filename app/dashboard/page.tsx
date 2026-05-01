import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardProfileCard from '@/components/dashboard/DashboardProfileCard';
import EarningsCard from '@/components/dashboard/EarningsCard';
import RecentGifts from '@/components/dashboard/RecentGifts';
import type { Contribution, Currency } from '@/types';

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const userId = session.user.id;

  const [
    { data: profile },
    { data: earningsData },
    { data: recentData },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('currency, display_name, username, avatar_url, bio')
      .eq('id', userId)
      .single(),

    // All confirmed contributions for EarningsCard period filtering
    supabase
      .from('contributions')
      .select('gift_amount, pool_id, created_at')
      .eq('recipient_id', userId)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false }),

    // Last 5 for Recent Supporters
    supabase
      .from('contributions')
      .select('*, tag:gift_tags!tag_id(*)')
      .eq('recipient_id', userId)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const currency     = (profile?.currency ?? 'NGN') as Currency;
  const displayName  = profile?.display_name ?? '';
  const username     = profile?.username ?? '';
  const avatarUrl    = profile?.avatar_url ?? null;
  const bio          = profile?.bio ?? null;

  const allContributions = (earningsData ?? []) as { gift_amount: number; pool_id: string | null; created_at: string }[];
  const recentContributions = (recentData ?? []) as Contribution[];

  return (
    <div style={{ width: '100%', maxWidth: '100%' }}>
      <DashboardProfileCard
        displayName={displayName}
        username={username}
        avatarUrl={avatarUrl}
        bio={bio}
      />

      <EarningsCard contributions={allContributions} currency={currency} />

      <RecentGifts contributions={recentContributions} currency={currency} creatorName={displayName} />
    </div>
  );
}
