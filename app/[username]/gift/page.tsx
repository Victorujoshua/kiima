import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getTagsByUser } from '@/lib/actions/tag.actions';
import GiftPageClient from '@/components/pages/GiftPageClient';
import PublicHeader from '@/components/layout/PublicHeader';
import type { Currency, GiftTag, Contribution } from '@/types';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kiima.app';

interface PageProps {
  params: { username: string };
  searchParams: { payment_failed?: string };
}

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, username')
    .eq('username', params.username)
    .single();

  if (!profile) return { title: 'Kiima' };

  const title = `Send ${profile.display_name} a gift`;
  const image = profile.avatar_url ?? `${APP_URL}/og-default.png`;

  return {
    title,
    openGraph: { title, images: [{ url: image }], siteName: 'Kiima' },
    twitter: { card: 'summary', title, images: [image] },
  };
}

export default async function GiftPage({ params, searchParams }: PageProps) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single();

  if (!profile) notFound();

  if ((profile as any).suspended) {
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

  const admin = createAdminClient();
  const [tags, settingsResult, recentResult, countResult] = await Promise.all([
    getTagsByUser(profile.id),
    admin.from('platform_settings').select('platform_fee_percent').limit(1).single(),
    supabase
      .from('contributions')
      .select('id, gift_amount, display_name, is_anonymous, created_at, tag_id, tag_label')
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
    <main style={pageStyle} data-page="gift-page">
      <PublicHeader />

      <div style={shellStyle}>

        {paymentFailed && (
          <div style={paymentFailedBannerStyle}>
            Payment didn&apos;t go through — please try again.
          </div>
        )}

        {/* Compact creator identity header */}
        <div style={creatorHeaderStyle}>
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
          <div>
            <p style={creatorNameStyle}>{profile.display_name}</p>
            <a href={`/${profile.username}`} style={backLinkStyle}>
              ← Back to page
            </a>
          </div>
        </div>

        {/* Gift form + supporters */}
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

const shellStyle: React.CSSProperties = {
  maxWidth: 480,
  margin: '0 auto',
  padding: '32px 20px 80px',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

const paymentFailedBannerStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontFamily: 'var(--kiima-font)',
  fontSize: '13px',
  color: 'var(--color-danger)',
  background: 'var(--color-danger-soft)',
  borderRadius: '10px',
  border: '1px solid rgba(224,112,112,0.3)',
};

const creatorHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  padding: '4px 0 8px',
};

const avatarWrapStyle: React.CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: '50%',
  overflow: 'hidden',
  flexShrink: 0,
  boxShadow: '0 0 0 2px #ffffff, 0 0 0 4px rgba(0,0,0,0.07)',
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
  fontSize: '18px',
};

const creatorNameStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontWeight: 700,
  fontSize: 16,
  color: '#1C1916',
  margin: 0,
  lineHeight: 1.2,
};

const backLinkStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontSize: 12,
  color: '#9A9089',
  textDecoration: 'none',
  marginTop: 4,
  display: 'block',
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
