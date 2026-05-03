import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import SupportPoolCard from '@/components/cards/SupportPoolCard';
import ContributionFeedCard from '@/components/cards/ContributionFeedCard';
import ContributeForm from '@/components/forms/ContributeForm';
import { formatCurrency } from '@/lib/utils/currency';
import PublicHeader from '@/components/layout/PublicHeader';
import type { Contribution, Currency, SupportPool } from '@/types';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kiima.app';

export async function generateMetadata({ params }: { params: { username: string; slug: string } }): Promise<Metadata> {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, username, currency')
    .eq('username', params.username)
    .single();

  if (!profile) return { title: 'Kiima' };

  const { data: pool } = await supabase
    .from('support_pools')
    .select('title, description, goal_amount')
    .eq('user_id', profile.id)
    .eq('slug', params.slug)
    .single();

  if (!pool) return { title: 'Kiima' };

  const title = `${pool.title} — Support ${profile.display_name}`;
  const description = pool.description
    ? pool.description.slice(0, 160)
    : `Help ${profile.display_name} reach their goal of ${formatCurrency(pool.goal_amount, profile.currency as Currency)}.`;
  const url = `${APP_URL}/${profile.username}/pool/${params.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Kiima',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

interface PageProps {
  params: { username: string; slug: string };
}

export default async function PoolPage({ params }: PageProps) {
  const supabase = createClient();

  // 1. Fetch creator profile by username
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, currency')
    .eq('username', params.username)
    .single();

  if (!profile) notFound();

  // 2. Fetch pool by creator + slug
  const { data: poolData } = await supabase
    .from('support_pools')
    .select('*')
    .eq('user_id', profile.id)
    .eq('slug', params.slug)
    .single();

  if (!poolData) notFound();
  const pool = poolData as SupportPool;

  // 3. Fetch fee percent for ContributeForm live breakdown
  const admin = createAdminClient();
  const { data: settings } = await admin
    .from('platform_settings')
    .select('platform_fee_percent')
    .limit(1)
    .single();
  const feePercent = settings?.platform_fee_percent ?? 3;

  // 4. Fetch confirmed contributor count (always) + recent contributions (if show_contributors)
  const countQuery = supabase
    .from('contributions')
    .select('id', { count: 'exact', head: true })
    .eq('pool_id', pool.id)
    .eq('status', 'confirmed');

  const contribQuery = pool.show_contributors
    ? supabase
        .from('contributions')
        .select('*')
        .eq('pool_id', pool.id)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false })
        .limit(10)
    : null;

  const [countResult, contribResult] = await Promise.all([
    countQuery,
    contribQuery ?? Promise.resolve({ data: null }),
  ]);

  const contributorCount = countResult.count ?? 0;
  const contributions = (contribResult.data ?? []) as Contribution[];

  return (
    <main style={pageStyle} className="k-page">
      <PublicHeader />
      <div style={gridStyle}>
        {/* Left column — pool info + optional contributor feed */}
        <div style={leftColStyle}>
          <SupportPoolCard
            pool={pool}
            currency={profile.currency as Currency}
            creatorName={profile.display_name}
            contributorCount={contributorCount}
          />
          {pool.show_contributors && contributions.length > 0 && (
            <ContributionFeedCard
              contributions={contributions}
              heading="Recent contributors"
            />
          )}
        </div>

        {/* Right column — contribute form or closed state */}
        <div>
          <ContributeForm
            poolId={pool.id}
            recipientId={profile.id}
            currency={profile.currency as Currency}
            isClosed={pool.status === 'closed'}
            feePercent={feePercent}
          />
        </div>
      </div>
    </main>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg)',
  padding: '108px 0 40px',
};

const gridStyle: React.CSSProperties = {
  maxWidth: '1080px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '16px',
  alignItems: 'start',
};

const leftColStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};
