'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Target, Settings, X, Sun, Moon, Pencil } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const NAV_ITEMS = [
  { href: '/dashboard',           label: 'Home',      Icon: Home     },
  { href: '/dashboard/edit-page', label: 'Edit page', Icon: Pencil   },
  { href: '/dashboard/pools',     label: 'Pools',     Icon: Target   },
  { href: '/dashboard/settings',  label: 'Settings',  Icon: Settings },
];

const PAGE_TITLES: { prefix: string; label: string }[] = [
  { prefix: '/dashboard/transactions', label: 'Transactions' },
  { prefix: '/dashboard/edit-page',    label: 'Edit page'   },
  { prefix: '/dashboard/pools',        label: 'Pools'       },
  { prefix: '/dashboard/settings',     label: 'Settings'    },
  { prefix: '/dashboard/links',        label: 'Links'       },
  { prefix: '/dashboard',              label: 'Home'        },
];

function getPageTitle(pathname: string) {
  return PAGE_TITLES.find(({ prefix }) => pathname.startsWith(prefix))?.label ?? '';
}

export default function MobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  function isActive(href: string) {
    return href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(href);
  }

  return (
    <>
      {/* Fixed top bar */}
      <header className="k-mobile-header">
        <span style={logoStyle}>
          kiima<span style={{ color: '#D7D744' }}>.</span>
        </span>

        <span style={pageTitleStyle}>{getPageTitle(pathname)}</span>

        <button
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          style={hamburgerStyle}
        >
          <span style={barStyle} />
          <span style={barStyle} />
          <span style={barStyle} />
        </button>
      </header>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 110,
          }}
        />
      )}

      {/* Slide-in drawer */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '72vw',
          maxWidth: '280px',
          background: '#000000',
          zIndex: 120,
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 16px',
        }}
      >
        {/* Drawer header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <span style={{ ...logoStyle, color: '#ffffff' }}>
            kiima<span style={{ color: '#D7D744' }}>.</span>
          </span>
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', padding: 4 }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '13px 14px',
                  fontFamily: 'var(--kiima-font)',
                  fontSize: 15,
                  fontWeight: active ? 700 : 500,
                  textDecoration: 'none',
                  background: active ? '#D7D744' : 'transparent',
                  color: active ? '#000000' : 'rgba(255,255,255,0.7)',
                  transition: 'background 0.15s ease, color 0.15s ease',
                }}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 1.5} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 14px',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.7)',
            fontFamily: 'var(--kiima-font)',
            fontSize: 14,
            fontWeight: 500,
            width: '100%',
            marginTop: 16,
          }}
          aria-label="Toggle dark mode"
        >
          {theme === 'dark'
            ? <Sun size={16} strokeWidth={2} />
            : <Moon size={16} strokeWidth={2} />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </nav>
    </>
  );
}

const logoStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontWeight: 800,
  fontSize: 20,
  color: '#ffffff',
  textDecoration: 'none',
  letterSpacing: '-0.02em',
};

const pageTitleStyle: React.CSSProperties = {
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  fontFamily: 'var(--kiima-font)',
  fontWeight: 700,
  fontSize: 15,
  color: '#ffffff',
  letterSpacing: '-0.01em',
  pointerEvents: 'none',
};

const hamburgerStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  gap: 5,
  padding: 6,
};

const barStyle: React.CSSProperties = {
  display: 'block',
  width: 22,
  height: 2,
  background: '#ffffff',
  borderRadius: 1,
};
