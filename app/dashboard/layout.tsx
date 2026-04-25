import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import MobileHeader from '@/components/dashboard/MobileHeader';

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

      {/* Mobile top header — hidden on desktop via CSS */}
      <MobileHeader />

      {/* Main content — responsive via CSS class */}
      <main className="k-dash-content">
        {children}
      </main>
    </div>
  );
}

const shellStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg)',
  display: 'flex',
};
