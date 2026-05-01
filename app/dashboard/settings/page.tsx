import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSocialLinks } from '@/lib/actions/link.actions';
import SettingsClient from './SettingsClient';
import type { Profile } from '@/types';

export default async function SettingsPage() {
  const supabase = createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const [profileResult, links] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', session.user.id).single(),
    getSocialLinks(session.user.id),
  ]);

  if (!profileResult.data) redirect('/login');

  const p = profileResult.data as Profile & {
    bank_name: string | null;
    account_number: string | null;
    account_name: string | null;
  };

  return (
    <SettingsClient
      profile={p}
      email={session.user.email ?? ''}
      links={links}
      bankName={p.bank_name}
      accountNumber={p.account_number}
      accountName={p.account_name}
    />
  );
}
