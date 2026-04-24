import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LogoutButton from '@/app/dashboard/LogoutButton';
import Link from 'next/link';

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username')
    .eq('id', session.user.id)
    .single();

  return (
    <div>
      <h1 style={headingStyle}>Settings</h1>

      <div style={cardStyle}>
        <div style={rowStyle}>
          <div>
            <p style={nameStyle}>{profile?.display_name ?? ''}</p>
            <p style={handleStyle}>@{profile?.username ?? ''}</p>
          </div>
          <Link href={`/${profile?.username ?? ''}`} target="_blank" rel="noopener noreferrer" style={viewLinkStyle}>
            View page →
          </Link>
        </div>
      </div>

      <div style={cardStyle}>
        <p style={sectionLabelStyle}>Account</p>
        <LogoutButton />
      </div>
    </div>
  );
}

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 500,
  fontSize: '26px',
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-lg)',
};

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--shadow-card)',
  padding: 'var(--space-xl)',
  marginBottom: 'var(--space-md)',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const nameStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '16px',
  color: 'var(--color-text-primary)',
  margin: '0 0 2px',
};

const handleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--color-text-muted)',
  margin: 0,
};

const viewLinkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '13px',
  color: 'var(--color-accent)',
  textDecoration: 'none',
};

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--color-text-faint)',
  margin: '0 0 var(--space-sm)',
};
