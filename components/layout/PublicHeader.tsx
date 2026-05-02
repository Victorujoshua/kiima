import Link from 'next/link';

export default function PublicHeader() {
  return (
    <header style={headerStyle}>
      <div style={innerStyle}>
        <Link href="/" style={logoStyle}>
          kiima<span style={{ color: '#D7D744' }}>.</span>
        </Link>
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
  padding: '0 40px',
  height: '68px',
  display: 'flex',
  alignItems: 'center',
};

const logoStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontWeight: 800,
  fontSize: '26px',
  color: '#ffffff',
  textDecoration: 'none',
  letterSpacing: '-0.02em',
};
