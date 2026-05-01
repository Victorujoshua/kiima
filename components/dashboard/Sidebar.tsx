'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Props {
  displayName: string;
  username:    string;
  avatarUrl:   string | null;
}

type NavItem =
  | { kind: 'section'; label: string }
  | { kind: 'link'; href: string; label: string; emoji: string; exact?: boolean; external?: boolean };

function buildNav(username: string, appUrl: string): NavItem[] {
  return [
    { kind: 'link', href: '/dashboard', label: 'Home', emoji: '🏠', exact: true },
    { kind: 'link', href: `${appUrl}/${username}`, label: 'View page', emoji: '👁', external: true },
    { kind: 'section', label: 'MONETIZE' },
    { kind: 'link', href: '/dashboard/transactions', label: 'Supporters', emoji: '❤️' },
    { kind: 'link', href: '/dashboard/pools',        label: 'Pools',      emoji: '🎯' },
    { kind: 'link', href: '/dashboard/tags',         label: 'Tags',       emoji: '🏷️' },
    { kind: 'section', label: 'SETTINGS' },
    { kind: 'link', href: '/dashboard/settings', label: 'Settings', emoji: '⚙️' },
  ];
}

export default function Sidebar({ displayName, username, avatarUrl }: Props) {
  const pathname = usePathname();
  const router   = useRouter();
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kiima.app';
  const navItems = buildNav(username, appUrl);
  const initial  = displayName.charAt(0).toUpperCase();

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <aside className="k-sidebar">
      {/* Logo */}
      <div style={{ padding: '24px 20px 16px' }}>
        <span style={logoStyle}>
          kiima<span style={{ color: '#D7D744' }}>.</span>
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '4px 12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {navItems.map((item, i) => {
          if (item.kind === 'section') {
            return <p key={i} style={sectionLabelStyle}>{item.label}</p>;
          }

          if (item.external) {
            return (
              <a
                key={i}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...navItemStyle, color: '#5A4D44', fontWeight: 500 }}
              >
                <span style={emojiStyle}>{item.emoji}</span>
                {item.label}
                <span style={{ fontSize: 11, color: '#B5AAAA', marginLeft: 'auto' }}>↗</span>
              </a>
            );
          }

          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                ...navItemStyle,
                background:  active ? '#F6F3EE' : 'transparent',
                color:       active ? '#1C1916' : '#5A4D44',
                fontWeight:  active ? 700 : 500,
              }}
            >
              <span style={emojiStyle}>{item.emoji}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: creator + logout */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid #F2EDE7' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={avatarCircleStyle}>
            {avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              <span style={avatarInitialStyle}>{initial}</span>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={creatorNameStyle}>{displayName}</p>
            <p style={creatorUsernameStyle}>@{username}</p>
          </div>
        </div>

        <button onClick={handleLogout} style={logoutBtnStyle}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#E07070'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#9A9089'; }}
        >
          Log out
        </button>
      </div>
    </aside>
  );
}

const logoStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 800,
  fontSize: 22,
  color: '#1C1916',
  letterSpacing: '-0.02em',
};

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#B5AAAA',
  margin: '14px 0 4px 12px',
};

const navItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 12px',
  borderRadius: 10,
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  textDecoration: 'none',
  transition: 'background 0.12s ease, color 0.12s ease',
  cursor: 'pointer',
};

const emojiStyle: React.CSSProperties = {
  fontSize: 16,
  lineHeight: 1,
  flexShrink: 0,
};

const avatarCircleStyle: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: '50%',
  background: '#1C1916',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  flexShrink: 0,
};

const avatarInitialStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 15,
  color: '#ffffff',
  lineHeight: 1,
  userSelect: 'none',
};

const creatorNameStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 13,
  color: '#1C1916',
  margin: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const creatorUsernameStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 12,
  color: '#B5AAAA',
  margin: '2px 0 0',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const logoutBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  fontWeight: 500,
  color: '#9A9089',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px 0',
  textDecoration: 'none',
  transition: 'color 0.15s ease',
};
