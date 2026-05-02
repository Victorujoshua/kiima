import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTagsByUser } from '@/lib/actions/tag.actions';
import EditPageClient from './EditPageClient';
import type { Profile, Currency } from '@/types';

export default async function EditPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const [profileResult, tags] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, username, display_name, bio, avatar_url, currency, theme_color')
      .eq('id', session.user.id)
      .single(),
    getTagsByUser(session.user.id),
  ]);

  if (!profileResult.data) redirect('/login');

  const profile = profileResult.data as Profile;
  const currency = (profile.currency ?? 'NGN') as Currency;

  // The default tag is always first (is_default = true, ordered first)
  const defaultTag = tags.find(t => t.is_default);

  return (
    <EditPageClient
      userId={profile.id}
      username={profile.username}
      initialDisplayName={profile.display_name}
      initialAvatarUrl={profile.avatar_url}
      initialBio={profile.bio}
      initialThemeColor={profile.theme_color ?? '#C87B5C'}
      initialTagLabel={defaultTag?.label ?? 'Buy me a drink 🥤'}
      initialTagAmount={defaultTag?.amount ?? 2000}
      currency={currency}
    />
  );
}
