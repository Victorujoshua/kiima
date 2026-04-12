import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTagsByUser } from '@/lib/actions/tag.actions';
import TagsClient from './TagsClient';
import type { Currency } from '@/types';

export default async function TagsPage() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect('/login');

  // Fetch the creator's profile to get their currency
  const { data: profile } = await supabase
    .from('profiles')
    .select('currency')
    .eq('id', session.user.id)
    .single();

  const tags = await getTagsByUser(session.user.id);

  return (
    <TagsClient
      tags={tags}
      userId={session.user.id}
      currency={(profile?.currency ?? 'NGN') as Currency}
    />
  );
}
