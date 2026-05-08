import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSocialLinks, getCreatorLinks } from '@/lib/actions/link.actions';
import SocialLinksForm from '@/components/forms/SocialLinksForm';
import LinksManager from '@/components/dashboard/LinksManager';
import type { SocialLink, CreatorLink } from '@/types';

export default async function LinksPage() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect('/login');

  const [socialLinks, creatorLinks] = await Promise.all([
    getSocialLinks(session.user.id),
    getCreatorLinks(session.user.id),
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

      {/* Creator link cards section */}
      <div>
        <div style={{ marginBottom: 20 }}>
          <h1 style={headingStyle}>Links</h1>
          <p style={subtitleStyle}>
            Link cards appear on your public page. Social icons show in your profile card.
          </p>
        </div>
        <LinksManager
          userId={session.user.id}
          initialLinks={creatorLinks as CreatorLink[]}
        />
      </div>

      {/* Divider */}
      <div style={dividerStyle} />

      {/* Social links section */}
      <div>
        <div style={{ marginBottom: 20 }}>
          <h2 style={sectionHeadingStyle}>Social profiles</h2>
          <p style={subtitleStyle}>
            Add your social handles — they appear as icon buttons in your profile card.
          </p>
        </div>
        <SocialLinksForm
          userId={session.user.id}
          existingLinks={socialLinks as SocialLink[]}
        />
      </div>

    </div>
  );
}

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 20,
  color: '#1C1916',
  margin: '0 0 4px',
};

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 16,
  color: '#1C1916',
  margin: '0 0 4px',
};

const subtitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  color: '#9A9089',
  margin: 0,
  lineHeight: 1.6,
};

const dividerStyle: React.CSSProperties = {
  height: 1,
  background: '#EBEBEB',
  marginTop: -16,
};
