import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getTagsByUser } from '@/lib/actions/tag.actions';
import { getSocialLinks } from '@/lib/actions/link.actions';
import GiftPageClient from '@/components/pages/GiftPageClient';
import type { Profile, Currency, SocialLink, GiftTag, Contribution } from '@/types';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kiima.app';

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, bio, avatar_url, username')
    .eq('username', params.username)
    .single();

  if (!profile) return { title: 'Kiima' };

  const title = `${profile.display_name}'s Kiima`;
  const description = profile.bio
    ? profile.bio.slice(0, 160)
    : `Send ${profile.display_name} a gift on Kiima.`;
  const url = `${APP_URL}/${profile.username}`;
  const image = profile.avatar_url ?? `${APP_URL}/og-default.png`;

  return {
    title,
    description,
    openGraph: { title, description, url, images: [{ url: image }], siteName: 'Kiima' },
    twitter: { card: 'summary', title, description, images: [image] },
  };
}

interface PageProps {
  params: { username: string };
  searchParams: { payment_failed?: string };
}

export default async function UserPage({ params, searchParams }: PageProps) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url, currency, created_at, suspended')
    .eq('username', params.username)
    .single();

  if (!profile) notFound();

  if ((profile as Profile & { suspended: boolean }).suspended) {
    return (
      <main style={pageStyle}>
        <div style={suspendedCardStyle}>
          <p style={{ fontSize: '36px', margin: '0 0 var(--space-sm)' }}>🔒</p>
          <p style={suspendedHeadingStyle}>This creator is unavailable</p>
          <p style={suspendedBodyStyle}>This page is temporarily unavailable.</p>
        </div>
      </main>
    );
  }

  const admin = createAdminClient();
  const [tags, links, settingsResult, recentResult, countResult] = await Promise.all([
    getTagsByUser(profile.id),
    getSocialLinks(profile.id),
    admin.from('platform_settings').select('platform_fee_percent').limit(1).single(),
    supabase
      .from('contributions')
      .select('id, gift_amount, display_name, is_anonymous, created_at, tag_id')
      .eq('recipient_id', profile.id)
      .eq('status', 'confirmed')
      .is('pool_id', null)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('contributions')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', profile.id)
      .eq('status', 'confirmed')
      .is('pool_id', null),
  ]);

  const feePercent = settingsResult.data?.platform_fee_percent ?? 3;
  const contributions = (recentResult.data ?? []) as Contribution[];
  const contributorCount = countResult.count ?? 0;

  const defaultTag = (tags as GiftTag[]).find(t => t.is_default);
  if (!defaultTag) notFound();

  const paymentFailed = searchParams.payment_failed === '1';

  return (
    <main style={pageStyle}>
      {paymentFailed && (
        <div style={paymentFailedBannerStyle}>
          Payment didn&apos;t go through — please try again.
        </div>
      )}

      {/* Section 1 — Profile header */}
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px' }}>
        {/* Cover image */}
        <div style={coverStyle} />

        {/* Avatar overlapping cover */}
        <div style={avatarWrapStyle}>
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              style={avatarImgStyle}
            />
          ) : (
            <div style={avatarFallbackStyle}>
              {profile.display_name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Name + username */}
        <div style={profileInfoStyle}>
          <h1 style={profileNameStyle}>{profile.display_name}</h1>
          <p style={profileUsernameStyle}>@{profile.username}</p>
        </div>
      </div>

      {/* Sections 2–4 + footer */}
      <GiftPageClient
        recipientId={profile.id}
        creatorName={profile.display_name}
        defaultTag={defaultTag}
        feePercent={feePercent}
        currency={profile.currency as Currency}
        contributions={contributions}
        contributorCount={contributorCount}
        bio={profile.bio}
        links={links as SocialLink[]}
      />
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg)',
  paddingBottom: '40px',
};

const coverStyle: React.CSSProperties = {
  height: '160px',
  borderRadius: 'var(--radius-lg)',
  background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-light) 60%, var(--color-accent-soft) 100%)',
};

const avatarWrapStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  marginTop: '-40px',
  marginBottom: '12px',
};

const avatarImgStyle: React.CSSProperties = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '3px solid var(--color-bg)',
  boxShadow: 'var(--shadow-card)',
};

const avatarFallbackStyle: React.CSSProperties = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  background: 'var(--color-accent)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '24px',
  border: '3px solid var(--color-bg)',
  boxShadow: 'var(--shadow-card)',
};

const profileInfoStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '20px',
};

const profileNameStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 500,
  fontSize: '26px',
  color: 'var(--color-text-primary)',
  margin: '0 0 4px',
};

const profileUsernameStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-muted)',
  margin: 0,
};

const paymentFailedBannerStyle: React.CSSProperties = {
  maxWidth: '480px',
  margin: '16px auto var(--space-md)',
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
