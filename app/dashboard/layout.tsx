import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/dashboard/Sidebar';
import NotificationBell from '@/components/dashboard/NotificationBell';
import type { Notification } from '@/types';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const userId = session.user.id;

  const [profileResult, notifResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name, username, avatar_url')
      .eq('id', userId)
      .single(),
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const profile = profileResult.data;
  const initialNotifications = (notifResult.data ?? []) as Notification[];
  const initialUnreadCount = initialNotifications.filter(n => !n.is_read).length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        displayName={profile?.display_name ?? ''}
        username={profile?.username ?? ''}
        avatarUrl={profile?.avatar_url ?? null}
      />

      <main className="k-dash-main">
        {/* Sticky topbar — desktop only (hidden via CSS on mobile) */}
        <div className="k-dash-topbar">
          <NotificationBell
            userId={userId}
            initialNotifications={initialNotifications}
            initialUnreadCount={initialUnreadCount}
          />
        </div>

        {/* Page content */}
        <div className="k-dash-inner">
          {children}
        </div>
      </main>
    </div>
  );
}
