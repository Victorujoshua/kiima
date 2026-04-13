import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSocialLinks } from '@/lib/actions/link.actions';
import SocialLinksForm from '@/components/forms/SocialLinksForm';
import type { SocialLink } from '@/types';

export default async function LinksPage() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect('/login');

  const links = await getSocialLinks(session.user.id);

  const pageStyle: React.CSSProperties = {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 0',
  };

  return (
    <div style={pageStyle}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          fontSize: '26px',
          color: 'var(--color-text-primary)',
          margin: '0 0 var(--space-xs)',
        }}
      >
        Your Links
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          color: 'var(--color-text-muted)',
          margin: '0 0 var(--space-2xl)',
          lineHeight: 1.65,
        }}
      >
        Add your social profiles so supporters can find you everywhere.
      </p>

      <SocialLinksForm
        userId={session.user.id}
        existingLinks={links as SocialLink[]}
      />
    </div>
  );
}
