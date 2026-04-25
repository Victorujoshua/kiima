'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Target, Tag, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard',          label: 'Home',     Icon: Home     },
  { href: '/dashboard/pools',    label: 'Pools',    Icon: Target   },
  { href: '/dashboard/tags',     label: 'Tags',     Icon: Tag      },
  { href: '/dashboard/settings', label: 'Settings', Icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    return href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(href);
  }

  return (
    <nav className="k-bottom-nav" style={navStyle}>
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            style={{
              ...tabStyle,
              color: active ? '#000000' : 'var(--color-text-muted)',
              fontWeight: active ? 700 : 500,
            }}
          >
            <Icon size={22} strokeWidth={active ? 2 : 1.5} />
            <span style={{ ...labelStyle, fontWeight: active ? 600 : 500 }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

const navStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  height: '64px',
  background: 'var(--color-surface)',
  borderTop: '2px solid #000000',
  display: 'flex',
  alignItems: 'stretch',
  zIndex: 50,
  backdropFilter: 'blur(8px)',
};

const tabStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '3px',
  textDecoration: 'none',
  transition: 'color 0.15s ease',
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '11px',
};
