import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BottomNav from '@/components/dashboard/BottomNav';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect('/login');

  return (
    <div style={shellStyle}>
      {/* Sidebar — hidden on mobile via CSS, shown on desktop */}
      <DashboardSidebar />

      {/* Main content — responsive via CSS class */}
      <main className="k-dash-content">
        {children}
      </main>

      {/* Bottom nav — hidden on desktop via CSS */}
      <BottomNav />
    </div>
  );
}

const shellStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg)',
  display: 'flex',
};
