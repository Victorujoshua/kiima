'use client';

import Link from 'next/link';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function PublicHeader() {
  const { theme, toggle } = useTheme();

  return (
    <header style={headerStyle}>
      <Link href="/" style={logoStyle}>
        kiima<span style={{ color: '#D7D744' }}>.</span>
      </Link>

      <button onClick={toggle} style={toggleStyle} aria-label="Toggle dark mode">
        {theme === 'dark'
          ? <Sun size={18} strokeWidth={2} />
          : <Moon size={18} strokeWidth={2} />}
      </button>
    </header>
  );
}

const headerStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: '52px',
  background: '#000000',
  borderBottom: '2px solid #D7D744',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 20px',
  zIndex: 100,
};

const logoStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontWeight: 800,
  fontSize: '28px',
  color: '#ffffff',
  textDecoration: 'none',
  letterSpacing: '-0.02em',
};

const toggleStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '6px',
  cursor: 'pointer',
  color: 'rgba(255,255,255,0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',
  height: '36px',
  transition: 'background 0.15s ease',
};
