'use client';

import Link from 'next/link';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function PublicHeader() {
  const { theme, toggle } = useTheme();

  return (
    <header style={headerStyle}>
      <div style={innerStyle}>
        <Link href="/" style={logoStyle}>
          kiima<span style={{ color: '#D7D744' }}>.</span>
        </Link>

        <button onClick={toggle} style={toggleStyle} aria-label="Toggle dark mode">
          {theme === 'dark'
            ? <Sun size={18} strokeWidth={2} />
            : <Moon size={18} strokeWidth={2} />}
        </button>
      </div>
    </header>
  );
}

const headerStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  background: '#000000',
  borderBottom: '2px solid #000000',
  zIndex: 100,
};

const innerStyle: React.CSSProperties = {
  maxWidth: '1120px',
  margin: '0 auto',
  padding: '0 60px',
  height: '68px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const logoStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontWeight: 800,
  fontSize: '26px',
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
