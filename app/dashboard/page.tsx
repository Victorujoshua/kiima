import { redirect } from 'next/navigation';
import Link from 'next/link';
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
    { data: withdrawalsData },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('currency, display_name, username, avatar_url, bio, bank_name, account_number')
      .eq('id', userId)
      .single(),

    supabase
      .from('contributions')
      .select('gift_amount, pool_id, created_at')
      .eq('recipient_id', userId)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false }),

    supabase
      .from('contributions')
      .select('*')
      .eq('recipient_id', userId)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })
      .limit(5),

    supabase
      .from('withdrawals')
      .select('amount')
      .eq('user_id', userId)
      .neq('status', 'cancelled'),
  ]);

  const currency    = (profile?.currency ?? 'NGN') as Currency;
  const displayName = profile?.display_name ?? '';
  const username    = profile?.username ?? '';
  const avatarUrl   = profile?.avatar_url ?? null;
  const bio         = profile?.bio ?? null;
  const bankName    = profile?.bank_name ?? null;
  const accountNumber = profile?.account_number ?? null;
  const hasBankAccount = !!(bankName && accountNumber);

  const allContributions    = (earningsData ?? []) as { gift_amount: number; pool_id: string | null; created_at: string }[];
  const recentContributions = (recentData ?? []) as Contribution[];
  const totalWithdrawn      = (withdrawalsData ?? []).reduce((s, w) => s + Number(w.amount), 0);
  const totalReceived       = allContributions.reduce((s, c) => s + Number(c.gift_amount), 0);
  const availableBalance    = totalReceived - totalWithdrawn;

  return (
    <div>
      {/* Bank account banner — shown until creator adds a bank account */}
      {!hasBankAccount && (
        <div style={bankBannerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <span style={{ fontSize: 20 }}>🏦</span>
            <div>
              <p style={bannerHeadingStyle}>Add your bank account</p>
              <p style={bannerBodyStyle}>Required to withdraw your earnings</p>
            </div>
          </div>
          <Link href="/dashboard/settings" style={bannerCtaStyle}>
            Add now →
          </Link>
        </div>
      )}

      <DashboardProfileCard
        displayName={displayName}
        username={username}
        avatarUrl={avatarUrl}
        bio={bio}
      />

      <EarningsCard
        contributions={allContributions}
        currency={currency}
        bankName={bankName}
        accountNumber={accountNumber}
        availableBalance={availableBalance}
      />

      <RecentGifts contributions={recentContributions} currency={currency} creatorName={displayName} />
    </div>
  );
}

const bankBannerStyle: React.CSSProperties = {
  display:      'flex',
  alignItems:   'center',
  justifyContent: 'space-between',
  gap:          12,
  background:   '#FFFBEA',
  border:       '1px solid #F0E68C',
  borderRadius: 12,
  padding:      16,
  marginBottom: 16,
  flexWrap:     'wrap',
};

const bannerHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize:   14,
  color:      '#1C1916',
  margin:     0,
};

const bannerBodyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize:   13,
  color:      '#5A4D44',
  margin:     '2px 0 0',
};

const bannerCtaStyle: React.CSSProperties = {
  fontFamily:    'var(--font-body)',
  fontWeight:    700,
  fontSize:      13,
  color:         '#1C1916',
  background:    '#F0E68C',
  border:        'none',
  borderRadius:  100,
  padding:       '8px 16px',
  textDecoration: 'none',
  whiteSpace:    'nowrap',
};
