import Link from 'next/link';

export default function PublicHeader() {
  return (
    <header style={headerStyle}>
      <div style={innerStyle}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-white.svg" alt="Kiima" height={28} width={79} style={{ display: 'block' }} />
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

