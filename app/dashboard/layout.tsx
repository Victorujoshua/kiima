import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/dashboard/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const userId = session.user.id;
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username, avatar_url')
    .eq('id', userId)
    .single();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        displayName={profile?.display_name ?? ''}
        username={profile?.username ?? ''}
        avatarUrl={profile?.avatar_url ?? null}
      />

      <main className="k-dash-main">
        {children}
      </main>
    </div>
  );
}
