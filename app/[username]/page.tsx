import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTagsByUser } from '@/lib/actions/tag.actions';
import ProfileCard from '@/components/cards/ProfileCard';
import GiftForm from '@/components/forms/GiftForm';
import type { Profile, Currency } from '@/types';

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

  // Fetch gift tags — contributions are private, shown only in creator dashboard
  const tags = await getTagsByUser(profile.id);

  return (
    <main style={pageStyle} className="k-page">
      <div style={gridStyle}>
        <ProfileCard profile={profile as Profile} />
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
  padding: '40px 0',
};

const gridStyle: React.CSSProperties = {
  maxWidth: '1080px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '16px',
  alignItems: 'start',
};

