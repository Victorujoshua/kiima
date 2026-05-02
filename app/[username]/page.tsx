import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getTagsByUser } from '@/lib/actions/tag.actions';
import { getSocialLinks } from '@/lib/actions/link.actions';
import GiftPageClient from '@/components/pages/GiftPageClient';
import PublicHeader from '@/components/layout/PublicHeader';
import SocialLinksRow from '@/components/shared/SocialLinksRow';
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
    ? profile.bio.replace(/<[^>]+>/g, '').slice(0, 160)
    : `Send ${profile.display_name} a gift on Kiima.`;
  const url = `${APP_URL}/${profile.username}`;
  const image = profile.avatar_url ?? `${APP_URL}/og-default.png`;

  return {
    title,
    description,
    icons: profile.avatar_url ? { icon: profile.avatar_url } : undefined,
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
    .select('id, username, display_name, bio, avatar_url, currency, theme_color, created_at, suspended')
    .eq('username', params.username)
    .single();

  if (!profile) notFound();

  if ((profile as Profile & { suspended: boolean }).suspended) {
    return (
      <main style={pageStyle}>
        <PublicHeader />
        <div style={suspendedCardStyle}>
          <p style={{ fontSize: '32px', margin: '0 0 var(--space-sm)' }}>🔒</p>
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
      <PublicHeader />

      {paymentFailed && (
        <div style={paymentFailedBannerStyle}>
          Payment didn&apos;t go through — please try again.
        </div>
      )}

      <div style={shellStyle}>

        {/* ── Creator hero ── */}
        <div style={heroStyle}>
          {/* Avatar */}
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
            {/* Olive corner accent */}
            <div style={avatarAccentStyle} />
          </div>

          <h1 style={displayNameStyle}>{profile.display_name}</h1>
          <p style={usernameTagStyle}>@{profile.username}</p>

          {profile.bio && (
            <div
              className="k-bio-prose k-bio-prose--dark"
              style={{ marginTop: '16px' }}
              dangerouslySetInnerHTML={{ __html: profile.bio }}
            />
          )}

          {(links as SocialLink[]).length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <SocialLinksRow links={links as SocialLink[]} onDark />
            </div>
          )}
        </div>

        {/* ── Olive stripe transition ── */}
        <div style={stripeStyle} />

        {/* ── Gift form + supporters ── */}
        <GiftPageClient
          recipientId={profile.id}
          creatorName={profile.display_name}
          defaultTag={defaultTag}
          feePercent={feePercent}
          currency={profile.currency as Currency}
          contributions={contributions}
          contributorCount={contributorCount}
        />
      </div>
    </main>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#000000',
  paddingTop: '68px',
};

const shellStyle: React.CSSProperties = {
  maxWidth: '480px',
  margin: '0 auto',
  padding: '48px 24px 80px',
};

const heroStyle: React.CSSProperties = {
  textAlign: 'center',
  paddingBottom: '40px',
};

const avatarWrapStyle: React.CSSProperties = {
  width: '88px',
  height: '88px',
  border: '2px solid #D7D744',
  margin: '0 auto 24px',
  overflow: 'hidden',
  position: 'relative',
  flexShrink: 0,
};

const avatarAccentStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '-5px',
  right: '-5px',
  width: '12px',
  height: '12px',
  background: '#D7D744',
  pointerEvents: 'none',
};

const avatarImgStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

const avatarFallbackStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  background: '#D7D744',
  color: '#000000',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--kiima-font)',
  fontWeight: 800,
  fontSize: '28px',
};

const displayNameStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontWeight: 800,
  fontSize: '38px',
  color: '#ffffff',
  margin: '0 0 8px',
  letterSpacing: '-1.5px',
  lineHeight: 1.1,
};

const usernameTagStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontSize: '11px',
  fontWeight: 700,
  color: '#D7D744',
  margin: 0,
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
};

const stripeStyle: React.CSSProperties = {
  height: '3px',
  background: '#D7D744',
  marginBottom: '0',
};

const paymentFailedBannerStyle: React.CSSProperties = {
  maxWidth: '480px',
  margin: '16px auto 0',
  fontFamily: 'var(--kiima-font)',
  fontSize: '13px',
  color: 'var(--color-danger)',
  background: 'rgba(224, 112, 112, 0.12)',
  border: '1px solid var(--color-danger)',
  padding: '12px var(--space-md)',
};

const suspendedCardStyle: React.CSSProperties = {
  maxWidth: '480px',
  margin: '80px auto 0',
  background: '#ffffff',
  padding: '40px',
  textAlign: 'center',
};

const suspendedHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontWeight: 800,
  fontSize: '22px',
  color: '#1C1916',
  margin: '0 0 var(--space-xs)',
};

const suspendedBodyStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontSize: '14px',
  color: '#5A4D44',
  margin: 0,
  lineHeight: 1.65,
};
