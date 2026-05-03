import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TransactionsClient from './TransactionsClient';
import type { Contribution, Currency } from '@/types';

interface ContributionWithPool extends Contribution {
  pool?: { title: string } | null;
}

export default async function TransactionsPage() {
  const supabase = createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const [{ data: contributions }, { data: profile }] = await Promise.all([
    supabase
      .from('contributions')
      .select('*, pool:support_pools!pool_id(title)')
      .eq('recipient_id', session.user.id)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })
      .limit(200),

    supabase
      .from('profiles')
      .select('currency')
      .eq('id', session.user.id)
      .single(),
  ]);

  return (
    <TransactionsClient
      contributions={(contributions ?? []) as ContributionWithPool[]}
      currency={(profile?.currency ?? 'NGN') as Currency}
    />
  );
}
