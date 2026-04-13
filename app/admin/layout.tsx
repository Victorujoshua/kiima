import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminNav from './AdminNav';
import AdminLogoutButton from './AdminLogoutButton';

// Admin layout — Section 15.1 Rules 2–4
// Checks session AND is_admin server-side on every request.
// No client-side check anywhere. Admin client used to fetch profile.

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Rule 3: Read session server-side.
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Logged-out users → /login
  if (!session) {
    redirect('/login');
  }

  // Rule 2 + 4: fetch profile, check is_admin.
  // Use admin client to bypass RLS — anon client cannot read is_admin.
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single();

  // Non-admin authenticated users → /dashboard
  if (!profile || !profile.is_admin) {
    redirect('/dashboard');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 200,
          flexShrink: 0,
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          padding: '28px 16px',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'auto',
        }}
      >
        {/* Brand */}
        <div
          style={{
            paddingLeft: 12,
            marginBottom: 32,
            display: 'flex',
            alignItems: 'baseline',
            gap: 8,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 18,
              fontWeight: 500,
              color: 'var(--color-text-primary)',
            }}
          >
            Kiima
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--color-accent)',
            }}
          >
            Admin
          </span>
        </div>

        <AdminNav />

        <div style={{ marginTop: 'auto', paddingTop: 24 }}>
          <AdminLogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
