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
    .select('id, username, display_name, bio, avatar_url, currency, theme_color, show_contributions, created_at, suspended')
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

      <div className="k-creator-shell">
        <div className="k-creator-grid">

          {/* ── LEFT: Creator profile ── */}
          <div className="k-creator-profile-sticky">
            <div style={profileCardStyle}>
              {/* Olive top accent */}
              <div style={oliveAccentStyle} />

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
              </div>

              <h1 style={displayNameStyle}>{profile.display_name}</h1>
              <p style={usernameTagStyle}>@{profile.username}</p>

              {profile.bio && (
                <div
                  className="k-bio-prose"
                  style={{ marginTop: '16px', padding: '0 28px' }}
                  dangerouslySetInnerHTML={{ __html: profile.bio }}
                />
              )}

              {(links as SocialLink[]).length > 0 && (
                <div style={{ marginTop: '20px', padding: '0 20px' }}>
                  <SocialLinksRow links={links as SocialLink[]} />
                </div>
              )}

              {/* Bottom spacer */}
              <div style={{ height: '28px' }} />
            </div>
          </div>

          {/* ── RIGHT: Gift form + supporters ── */}
          <div>
            <GiftPageClient
              recipientId={profile.id}
              creatorName={profile.display_name}
              defaultTag={defaultTag}
              feePercent={feePercent}
              currency={profile.currency as Currency}
              contributions={contributions}
              contributorCount={contributorCount}
              showContributions={(profile as any).show_contributions ?? true}
            />
          </div>

        </div>
      </div>
    </main>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg)',
  paddingTop: '68px',
};

const profileCardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '2px solid #000000',
  boxShadow: '4px 4px 0 0 #000000',
  overflow: 'hidden',
};

const oliveAccentStyle: React.CSSProperties = {
  height: '4px',
  background: '#D7D744',
};

const avatarWrapStyle: React.CSSProperties = {
  width: '80px',
  height: '80px',
  border: '2px solid #000000',
  margin: '28px 28px 0',
  overflow: 'hidden',
  flexShrink: 0,
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
  fontSize: '24px',
};

const displayNameStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontWeight: 800,
  fontSize: '26px',
  color: '#1C1916',
  margin: '16px 28px 0',
  letterSpacing: '-0.8px',
  lineHeight: 1.15,
};

const usernameTagStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontSize: '11px',
  fontWeight: 700,
  color: '#D7D744',
  background: '#000000',
  display: 'inline-block',
  margin: '8px 28px 0',
  padding: '3px 8px',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
};

const paymentFailedBannerStyle: React.CSSProperties = {
  maxWidth: '1080px',
  margin: '0 auto',
  padding: '12px 20px',
  fontFamily: 'var(--kiima-font)',
  fontSize: '13px',
  color: 'var(--color-danger)',
  background: 'var(--color-danger-soft)',
  border: '1px solid var(--color-danger)',
};

const suspendedCardStyle: React.CSSProperties = {
  maxWidth: '480px',
  margin: '80px auto 0',
  background: 'var(--color-surface)',
  border: '2px solid #000000',
  boxShadow: '4px 4px 0 0 #000000',
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
