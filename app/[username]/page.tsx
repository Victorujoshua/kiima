import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getTagsByUser } from '@/lib/actions/tag.actions';
import { getSocialLinks } from '@/lib/actions/link.actions';
import ProfileCard from '@/components/cards/ProfileCard';
import GiftForm from '@/components/forms/GiftForm';
import type { Profile, Currency, SocialLink } from '@/types';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kiima.co';

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, bio, avatar_url, username')
    .eq('username', params.username)
    .single();

  if (!profile) {
    return { title: 'Kiima' };
  }

  const title = `${profile.display_name}'s Kiima`;
  const description = profile.bio
    ? profile.bio.slice(0, 160)
    : `Send ${profile.display_name} a gift on Kiima.`;
  const url = `${APP_URL}/${profile.username}`;
  const image = profile.avatar_url ?? `${APP_URL}/og-default.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: [{ url: image }],
      siteName: 'Kiima',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [image],
    },
  };
}

interface PageProps {
  params: { username: string };
  searchParams: { payment_failed?: string };
}

export default async function UserPage({ params, searchParams }: PageProps) {
  const supabase = createClient();

  // Fetch creator profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url, currency, created_at')
    .eq('username', params.username)
    .single();

  if (!profile) notFound();

  // Fetch gift tags and social links in parallel
  const [tags, links] = await Promise.all([
    getTagsByUser(profile.id),
    getSocialLinks(profile.id),
  ]);

  const paymentFailed = searchParams.payment_failed === '1';

  return (
    <main style={pageStyle} className="k-page">
      {paymentFailed && (
        <div style={paymentFailedBannerStyle}>
          Payment didn&apos;t go through — please try again.
        </div>
      )}
      <div style={gridStyle}>
        <ProfileCard profile={profile as Profile} links={links as SocialLink[]} />
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

const paymentFailedBannerStyle: React.CSSProperties = {
  maxWidth: '1080px',
  margin: '0 auto var(--space-md)',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-danger)',
  background: 'var(--color-danger-soft)',
  borderRadius: 'var(--radius-md)',
  padding: '12px var(--space-md)',
};

const gridStyle: React.CSSProperties = {
  maxWidth: '1080px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '16px',
  alignItems: 'start',
};

