import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import DashboardNav from './DashboardNav';
import LogoutButton from './LogoutButton';

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username')
    .eq('id', session.user.id)
    .single();

  const displayName = profile?.display_name ?? '';
  const username    = profile?.username    ?? '';
  const initial     = displayName.charAt(0).toUpperCase();

  return (
    <div className="k-dash-shell">
      {/* ── Sidebar (desktop only) ── */}
      <aside className="k-dash-sidebar">
        {/* Brand */}
        <p style={brandStyle}>Kiima</p>

        {/* Spacer */}
        <div style={{ marginBottom: 'var(--space-lg)' }} />

        {/* Nav */}
        <DashboardNav variant="sidebar" />

        {/* Push bottom section down */}
        <div style={{ flex: 1 }} />

        {/* Creator section */}
        <div style={creatorSectionStyle}>
          {/* Avatar + name */}
          <div style={avatarRowStyle}>
            <span style={avatarStyle}>{initial}</span>
            <span style={creatorNameStyle}>{displayName}</span>
          </div>

          {/* View gift page */}
          <Link
            href={`/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            style={giftPageLinkStyle}
          >
            View my gift page →
          </Link>

          {/* Logout */}
          <LogoutButton />
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="k-dash-main">
        {children}
      </main>

      {/* ── Bottom tab bar (mobile only) ── */}
      <DashboardNav variant="tabs" />
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const brandStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 500,
  fontSize: '20px',
  color: 'var(--color-text-primary)',
  margin: 0,
  letterSpacing: '-0.01em',
};

const creatorSectionStyle: React.CSSProperties = {
  borderTop: '1px solid var(--color-border)',
  paddingTop: 'var(--space-md)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-xs)',
};

const avatarRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-sm)',
  padding: '0 var(--space-md)',
  marginBottom: 'var(--space-xs)',
};

const avatarStyle: React.CSSProperties = {
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  background: 'var(--color-accent-soft)',
  color: 'var(--color-accent)',
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '13px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const creatorNameStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '13px',
  color: 'var(--color-text-primary)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const giftPageLinkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 500,
  fontSize: '13px',
  color: 'var(--color-accent)',
  textDecoration: 'none',
  padding: '10px var(--space-md)',
  display: 'block',
  transition: 'opacity 0.15s ease',
};
