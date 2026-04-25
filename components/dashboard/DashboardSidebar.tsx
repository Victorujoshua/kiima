'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Target, Tag, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const NAV_ITEMS = [
  { href: '/dashboard',          label: 'Home',     Icon: Home     },
  { href: '/dashboard/pools',    label: 'Pools',    Icon: Target   },
  { href: '/dashboard/tags',     label: 'Tags',     Icon: Tag      },
  { href: '/dashboard/settings', label: 'Settings', Icon: Settings },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  function isActive(href: string) {
    return href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(href);
  }

  return (
    <aside className="k-dash-sidebar">
      <Link href="/" style={logoStyle}>
        kiima<span style={{ color: '#D7D744' }}>.</span>
      </Link>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 36, flex: 1 }}>
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                ...navLinkStyle,
                background: active ? '#D7D744' : 'transparent',
                color: active ? '#000000' : 'rgba(255,255,255,0.6)',
                fontWeight: active ? 700 : 500,
              }}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Theme toggle */}
      <button onClick={toggle} style={toggleStyle} aria-label="Toggle dark mode">
        {theme === 'dark'
          ? <Sun size={16} strokeWidth={2} />
          : <Moon size={16} strokeWidth={2} />}
        <span style={{ fontSize: 13, fontWeight: 500 }}>
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </span>
      </button>
    </aside>
  );
}

const logoStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontWeight: 800,
  fontSize: 22,
  color: '#ffffff',
  textDecoration: 'none',
  letterSpacing: '-0.02em',
  display: 'block',
  padding: '0 12px',
};

const navLinkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '11px 12px',
  fontFamily: 'var(--kiima-font)',
  fontSize: 14,
  textDecoration: 'none',
  transition: 'background 0.15s ease, color 0.15s ease',
};

const toggleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 12px',
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)',
  cursor: 'pointer',
  color: 'rgba(255,255,255,0.7)',
  fontFamily: 'var(--kiima-font)',
  width: '100%',
  marginTop: 8,
  transition: 'background 0.15s ease',
};
