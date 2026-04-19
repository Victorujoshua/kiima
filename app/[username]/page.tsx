import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
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

  // Fetch creator profile (include suspended so we can gate the page)
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url, currency, created_at, suspended')
    .eq('username', params.username)
    .single();

  if (!profile) notFound();

  // Suspended creators are not visible to the public
  if ((profile as Profile & { suspended: boolean }).suspended) {
    return (
      <main style={pageStyle} className="k-page">
        <div style={suspendedCardStyle}>
          <p style={suspendedEmojiStyle}>🔒</p>
          <p style={suspendedHeadingStyle}>This creator is unavailable</p>
          <p style={suspendedBodyStyle}>
            This page is temporarily unavailable.
          </p>
        </div>
      </main>
    );
  }

  // Fetch gift tags, social links, and platform fee percent in parallel
  const admin = createAdminClient();
  const [tags, links, settingsResult] = await Promise.all([
    getTagsByUser(profile.id),
    getSocialLinks(profile.id),
    admin.from('platform_settings').select('platform_fee_percent').limit(1).single(),
  ]);
  const feePercent = settingsResult.data?.platform_fee_percent ?? 3;

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
          feePercent={feePercent}
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

const suspendedCardStyle: React.CSSProperties = {
  maxWidth: '480px',
  margin: '80px auto 0',
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--shadow-card)',
  padding: 'var(--space-2xl)',
  textAlign: 'center',
};

const suspendedEmojiStyle: React.CSSProperties = {
  fontSize: '36px',
  margin: '0 0 var(--space-sm)',
};

const suspendedHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 500,
  fontSize: '22px',
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-xs)',
};

const suspendedBodyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-secondary)',
  margin: 0,
  lineHeight: 1.65,
};

const gridStyle: React.CSSProperties = {
  maxWidth: '1080px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '16px',
  alignItems: 'start',
};

