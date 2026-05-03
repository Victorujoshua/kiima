'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, Eye, PenLine, Heart, Target, Settings, LogOut, ExternalLink, Menu, X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { LucideIcon } from 'lucide-react';

interface Props {
  displayName: string;
  username:    string;
  avatarUrl:   string | null;
}

type NavItem =
  | { kind: 'section'; label: string }
  | { kind: 'link'; href: string; label: string; Icon: LucideIcon; exact?: boolean; external?: boolean };

const MOBILE_PAGE_TITLES: Record<string, string> = {
  '/dashboard/edit-page':    'Edit page',
  '/dashboard/transactions': 'Supporters',
  '/dashboard/pools':        'Pools',
  '/dashboard/links':        'Social links',
  '/dashboard/settings':     'Settings',
};

function getMobilePageTitle(pathname: string): string {
  if (MOBILE_PAGE_TITLES[pathname]) return MOBILE_PAGE_TITLES[pathname];
  for (const [route, title] of Object.entries(MOBILE_PAGE_TITLES)) {
    if (pathname.startsWith(route)) return title;
  }
  return '';
}

function buildNav(username: string, appUrl: string): NavItem[] {
  return [
    { kind: 'link', href: '/dashboard',           label: 'Home',       Icon: Home,    exact: true },
    { kind: 'link', href: `${appUrl}/${username}`, label: 'View page',  Icon: Eye,     external: true },
    { kind: 'link', href: '/dashboard/edit-page',  label: 'Edit page',  Icon: PenLine  },
    { kind: 'section', label: 'MONETIZE' },
    { kind: 'link', href: '/dashboard/transactions', label: 'Supporters', Icon: Heart  },
    { kind: 'link', href: '/dashboard/pools',        label: 'Pools',      Icon: Target },
    { kind: 'section', label: 'SETTINGS' },
    { kind: 'link', href: '/dashboard/settings',     label: 'Settings',   Icon: Settings },
  ];
}

export default function Sidebar({ displayName, username, avatarUrl }: Props) {
  const pathname    = usePathname();
  const router      = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const appUrl      = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kiima.app';
  const navItems    = buildNav(username, appUrl);
  const initial     = displayName.charAt(0).toUpperCase();
  const pageTitle   = getMobilePageTitle(pathname);

  // Close on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Lock body scroll when sidebar overlay is open on mobile
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

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
    <>
      {/* Mobile top bar — hamburger trigger, hidden on desktop via CSS */}
      <div className="k-mob-topbar">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-white.svg" alt="Kiima" height={22} width={62} style={{ display: 'block' }} />

        {/* Page title — absolutely centered, non-interactive so logo/hamburger stay clickable */}
        {pageTitle && (
          <span style={mobilePageTitleStyle}>{pageTitle}</span>
        )}

        <button
          aria-label="Open navigation"
          onClick={() => setMobileOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}
        >
          <Menu size={22} color="#ffffff" strokeWidth={2} />
        </button>
      </div>

      {/* Backdrop — dims content when sidebar is open on mobile */}
      {mobileOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 110 }}
        />
      )}

    <aside className={`k-sidebar${mobileOpen ? ' k-sidebar-open' : ''}`}>
      {/* Logo + mobile close */}
      <div style={{ padding: '24px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-white.svg" alt="Kiima" height={24} width={68} style={{ display: 'block' }} />
        <button
          className="k-mob-close-btn"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4, color: '#9A9089' }}
        >
          <X size={18} strokeWidth={2} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '4px 12px', display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto' }}>
        {navItems.map((item, i) => {
          if (item.kind === 'section') {
            return (
              <p key={i} style={sectionLabelStyle}>{item.label}</p>
            );
          }

          const { Icon } = item;

          if (item.external) {
            return (
              <a
                key={i}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                style={navItemStyle(false)}
              >
                <span style={iconSlotStyle(false)}>
                  <Icon size={15} strokeWidth={1.5} />
                </span>
                <span style={navTextStyle(false)}>{item.label}</span>
                <ExternalLink size={11} strokeWidth={1.5} style={{ marginLeft: 'auto', color: '#C4BDB7', flexShrink: 0 }} />
              </a>
            );
          }

          const active = isActive(item.href, item.exact);
          return (
            <Link key={item.href} href={item.href} style={navItemStyle(active)}>
              <span style={iconSlotStyle(active)}>
                <Icon size={15} strokeWidth={active ? 2 : 1.5} />
              </span>
              <span style={navTextStyle(active)}>{item.label}</span>
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

        <button
          onClick={handleLogout}
          style={logoutBtnStyle}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FF5C00'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#9A9089'; }}
        >
          <LogOut size={13} strokeWidth={1.5} />
          Log out
        </button>
      </div>
    </aside>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────


const mobilePageTitleStyle: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  textAlign: 'center',
  fontFamily: 'var(--kiima-font)',
  fontWeight: 700,
  fontSize: '15px',
  color: '#ffffff',
  letterSpacing: '-0.2px',
  pointerEvents: 'none',
};

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 10,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#C4BDB7',
  margin: '16px 0 4px',
  // Align with the text column: icon slot (26px) + gap (10px) + item padding (12px) = 48px
  paddingLeft: 48,
};

function navItemStyle(active: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '7px 12px',
    borderRadius: 8,
    textDecoration: 'none',
    transition: 'background 0.12s ease',
    background: 'transparent',
    cursor: 'pointer',
  };
}

// Icon slot: fixed 26×26 box — active gets olive fill, inactive is transparent
function iconSlotStyle(active: boolean): React.CSSProperties {
  return {
    width: 26,
    height: 26,
    borderRadius: 6,
    background: active ? '#D7D744' : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: active ? '#000000' : '#9A9089',
    transition: 'background 0.12s ease, color 0.12s ease',
  };
}

function navTextStyle(active: boolean): React.CSSProperties {
  return {
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    fontWeight: active ? 700 : 500,
    color: active ? '#1C1916' : '#5A4D44',
    lineHeight: 1,
    transition: 'color 0.12s ease',
  };
}

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
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  fontWeight: 500,
  color: '#9A9089',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px 0',
  transition: 'color 0.15s ease',
};
