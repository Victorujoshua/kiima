import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BottomNav from '@/components/dashboard/BottomNav';

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
      <main style={mainStyle}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

const shellStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg)',
};

const mainStyle: React.CSSProperties = {
  maxWidth: '480px',
  margin: '0 auto',
  padding: '20px 20px 80px',
};
