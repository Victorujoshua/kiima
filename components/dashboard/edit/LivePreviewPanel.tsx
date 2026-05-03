'use client';

interface Props {
  displayName: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  themeColor: string;
  tagLabel: string;
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function LivePreviewPanel({ displayName, username, avatarUrl, bio, themeColor, tagLabel }: Props) {
  return (
    <div style={panelWrapStyle}>
      <p style={labelStyle}>Live preview</p>

      {/* Phone frame */}
      <div style={phoneFrameStyle}>
        {/* Status bar */}
        <div style={statusBarStyle}>
          <span style={{ fontSize: 9, fontWeight: 700 }}>9:41</span>
          <span style={{ fontSize: 9 }}>●●●</span>
        </div>

        {/* Header bar */}
        <div style={headerBarStyle}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-white.svg" alt="Kiima" height={12} width={34} style={{ display: 'block' }} />
        </div>

        {/* Content area */}
        <div style={contentAreaStyle}>
          {/* Profile card */}
          <div style={profileCardStyle}>
            {/* Avatar */}
            <div style={avatarStyle}>
              {avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <span style={initialsPreviewStyle}>{getInitials(displayName)}</span>
              )}
            </div>

            <p style={namePreviewStyle}>{displayName || 'Your name'}</p>
            <p style={usernamePreviewStyle}>kiima.app/{username}</p>

            {bio && (
              <div
                style={bioPreviewStyle}
                dangerouslySetInnerHTML={{ __html: bio }}
              />
            )}
          </div>

          {/* Gift tag pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '0 12px' }}>
            <div style={pillStyle(themeColor, true)}>{tagLabel || 'Buy me a drink 🥤'}</div>
            <div style={pillStyle(themeColor, false)}>Custom</div>
          </div>

          {/* Amount input mock */}
          <div style={inputMockStyle}>
            <span style={{ fontSize: 9, color: '#B5AAAA', fontFamily: 'var(--font-body)' }}>How much?</span>
          </div>

          {/* CTA button */}
          <div style={ctaBtnStyle(themeColor)}>
            Send gift ❤️
          </div>
        </div>
      </div>
    </div>
  );
}

function pillStyle(color: string, selected: boolean): React.CSSProperties {
  return {
    fontFamily: 'var(--font-body)',
    fontWeight: selected ? 700 : 500,
    fontSize: 9,
    color: selected ? '#ffffff' : color,
    background: selected ? color : `${color}18`,
    border: selected ? 'none' : `1px solid ${color}40`,
    borderRadius: 100,
    padding: '4px 8px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 100,
  };
}

function ctaBtnStyle(color: string): React.CSSProperties {
  return {
    margin: '8px 12px 0',
    background: color,
    borderRadius: 100,
    padding: '8px 0',
    textAlign: 'center',
    fontFamily: 'var(--font-body)',
    fontWeight: 700,
    fontSize: 10,
    color: '#ffffff',
  };
}

const panelWrapStyle: React.CSSProperties = {
  position: 'sticky',
  top: 32,
  width: 240,
  flexShrink: 0,
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#B5AAAA',
  margin: '0 0 12px',
};

const phoneFrameStyle: React.CSSProperties = {
  width: 240,
  background: '#1C1916',
  borderRadius: 28,
  overflow: 'hidden',
  boxShadow: '0 16px 48px rgba(28,25,22,0.22)',
  border: '6px solid #1C1916',
};

const statusBarStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '6px 14px 4px',
  background: '#1C1916',
  color: '#ffffff',
};

const headerBarStyle: React.CSSProperties = {
  background: '#000000',
  padding: '6px 12px',
  display: 'flex',
  alignItems: 'center',
};

const headerLogoStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 800,
  fontSize: 12,
  color: '#ffffff',
  letterSpacing: '-0.02em',
};

const contentAreaStyle: React.CSSProperties = {
  background: '#F6F3EE',
  minHeight: 380,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  paddingBottom: 16,
};

const profileCardStyle: React.CSSProperties = {
  background: '#ffffff',
  margin: '10px 12px 0',
  borderRadius: 12,
  border: '1px solid #EBEBEB',
  padding: '16px 12px 12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
};

const avatarStyle: React.CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: '50%',
  background: '#F5F0EB',
  border: '1px solid #EBEBEB',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 4,
};

const initialsPreviewStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 16,
  color: '#1C1916',
};

const namePreviewStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 12,
  color: '#1C1916',
  margin: 0,
  textAlign: 'center',
};

const usernamePreviewStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 9,
  color: '#9A9089',
  margin: 0,
};

const bioPreviewStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 9,
  color: '#5A4D44',
  margin: '4px 0 0',
  textAlign: 'center',
  lineHeight: 1.5,
  maxWidth: '100%',
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
};

const inputMockStyle: React.CSSProperties = {
  margin: '0 12px',
  height: 28,
  background: '#ffffff',
  border: '1px solid #EBEBEB',
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  padding: '0 10px',
};
