import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTagsByUser } from '@/lib/actions/tag.actions';
import ProfileCard from '@/components/cards/ProfileCard';
import GiftForm from '@/components/forms/GiftForm';
import ContributionFeedCard from '@/components/cards/ContributionFeedCard';
import type { Profile, Currency, Contribution } from '@/types';

interface PageProps {
  params: { username: string };
}

export default async function UserPage({ params }: PageProps) {
  const supabase = createClient();

  // Fetch creator profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url, currency, created_at')
    .eq('username', params.username)
    .single();

  if (!profile) notFound();

  // Fetch tags and confirmed direct-gift contributions in parallel
  const [tags, { data: rawContributions }] = await Promise.all([
    getTagsByUser(profile.id),
    supabase
      .from('contributions')
      .select('*, tag:gift_tags!tag_id(*)')
      .eq('recipient_id', profile.id)
      .eq('status', 'confirmed')
      .is('pool_id', null)          // direct gifts only — pool contributions show on pool page
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const contributions = (rawContributions ?? []) as Contribution[];

  return (
    <main style={pageStyle}>
      <div style={gridStyle}>
        {/* Left column: profile info + contribution feed */}
        <div style={leftColStyle}>
          <ProfileCard profile={profile as Profile} />
          <ContributionFeedCard contributions={contributions} />
        </div>

        {/* Right column: gift form */}
        <GiftForm
          recipientId={profile.id}
          tags={tags}
          currency={profile.currency as Currency}
        />
      </div>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg)',
  padding: '40px 20px',
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
