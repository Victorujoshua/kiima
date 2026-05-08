import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getTagsByUser } from '@/lib/actions/tag.actions';
import { getSocialLinks, getCreatorLinks } from '@/lib/actions/link.actions';
import PublicHeader from '@/components/layout/PublicHeader';
import SocialLinksRow from '@/components/shared/SocialLinksRow';
import EmbedBlock from '@/components/shared/EmbedBlock';
import CreatorLinkCard from '@/components/pages/CreatorLinkCard';
import StickyGiftButton from '@/components/shared/StickyGiftButton';
import type { Profile, Currency, SocialLink, GiftTag, CreatorLink } from '@/types';

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
}

export default async function UserPage({ params }: PageProps) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single();

  if (!profile) notFound();

  if ((profile as Profile & { suspended: boolean }).suspended) {
    return (
      <main style={pageStyle} data-page="gift-page">
        <PublicHeader />
        <div style={suspendedCardStyle}>
          <p style={{ fontSize: '32px', margin: '0 0 8px' }}>🔒</p>
          <p style={suspendedHeadingStyle}>This creator is unavailable</p>
          <p style={suspendedBodyStyle}>This page is temporarily unavailable.</p>
        </div>
      </main>
    );
  }

  const [tags, links, creatorLinks] = await Promise.all([
    getTagsByUser(profile.id),
    getSocialLinks(profile.id),
    getCreatorLinks(profile.id, true),
  ]);

  const defaultTag = (tags as GiftTag[]).find(t => t.is_default);
  if (!defaultTag) notFound();

  const embedUrl = (profile as Profile & { embed_url?: string | null }).embed_url ?? null;

  return (
    <main style={pageStyle} data-page="gift-page">
      <PublicHeader />

      <div className="k-creator-shell">
        <div className="k-creator-grid">

          {/* ── LEFT: Creator profile ── */}
          <div className="k-creator-profile-sticky">
            <div style={profileCardStyle}>

              <div style={avatarOuterStyle}>
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
              </div>

              <div style={profileTextBlockStyle}>
                <h1 style={displayNameStyle}>{profile.display_name}</h1>
                <p style={usernameTagStyle}>@{profile.username}</p>
              </div>

              {(profile.bio || (links as SocialLink[]).length > 0) && (
                <div style={profileDividerStyle} />
              )}

              {profile.bio && (
                <div
                  className="k-bio-prose"
                  style={bioStyle}
                  dangerouslySetInnerHTML={{ __html: profile.bio }}
                />
              )}

              {(links as SocialLink[]).length > 0 && (
                <div style={socialLinksWrapStyle}>
                  <SocialLinksRow links={links as SocialLink[]} />
                </div>
              )}

            </div>
          </div>

          {/* ── RIGHT: Embed + link cards ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {embedUrl && <EmbedBlock url={embedUrl} />}
            {(creatorLinks as CreatorLink[]).map(link => (
              <CreatorLinkCard key={link.id} link={link} />
            ))}
          </div>

        </div>
      </div>

      <StickyGiftButton
        label={defaultTag.label}
        amount={defaultTag.amount}
        currency={profile.currency as Currency}
        username={profile.username}
      />
    </main>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#F6F3EE',
  backgroundColor: '#F6F3EE',
  paddingTop: '68px',
  colorScheme: 'light',
};

const profileCardStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: '20px',
  border: '1px solid rgba(0,0,0,0.07)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.05)',
  overflow: 'hidden',
  paddingBottom: '28px',
};

const avatarOuterStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  paddingTop: '32px',
};

const avatarWrapStyle: React.CSSProperties = {
  width: '84px',
  height: '84px',
  borderRadius: '50%',
  overflow: 'hidden',
  flexShrink: 0,
  boxShadow: '0 0 0 3px #ffffff, 0 0 0 5px rgba(0,0,0,0.08)',
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
  fontSize: '26px',
};

const profileTextBlockStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '16px 24px 0',
};

const displayNameStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontWeight: 800,
  fontSize: '22px',
  color: '#1C1916',
  margin: '0 0 4px',
  letterSpacing: '-0.5px',
  lineHeight: 1.2,
};

const usernameTagStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontSize: '13px',
  fontWeight: 500,
  color: '#9A9089',
  margin: 0,
  letterSpacing: '0.01em',
};

const profileDividerStyle: React.CSSProperties = {
  height: '1px',
  background: 'rgba(0,0,0,0.06)',
  margin: '20px 24px 0',
};

const bioStyle: React.CSSProperties = {
  marginTop: '16px',
  padding: '0 24px',
};

const socialLinksWrapStyle: React.CSSProperties = {
  marginTop: '16px',
  padding: '0 16px',
};

const suspendedCardStyle: React.CSSProperties = {
  maxWidth: '400px',
  margin: '80px auto 0',
  background: '#ffffff',
  borderRadius: '20px',
  border: '1px solid rgba(0,0,0,0.07)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  padding: '48px 40px',
  textAlign: 'center',
};

const suspendedHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontWeight: 700,
  fontSize: '18px',
  color: '#1C1916',
  margin: '0 0 6px',
};

const suspendedBodyStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontSize: '14px',
  color: '#9A9089',
  margin: 0,
  lineHeight: 1.6,
};
