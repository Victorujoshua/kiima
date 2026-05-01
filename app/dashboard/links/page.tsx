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

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 20, color: '#1C1916', margin: '0 0 4px' }}>
          Social links
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#9A9089', margin: 0, lineHeight: 1.6 }}>
          Add your social profiles so supporters can find you everywhere.
        </p>
      </div>

      <SocialLinksForm
        userId={session.user.id}
        existingLinks={links as SocialLink[]}
      />
    </div>
  );
}
