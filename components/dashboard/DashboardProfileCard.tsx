'use client';

import { useState } from 'react';

interface Props {
  displayName: string;
  username:    string;
  avatarUrl:   string | null;
  bio:         string | null;
}

export default function DashboardProfileCard({ displayName, username, avatarUrl, bio }: Props) {
  const [copied, setCopied] = useState(false);
  const appUrl      = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kiima.app';
  const profileUrl  = `${appUrl}/${username}`;
  const initial     = displayName.charAt(0).toUpperCase();

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Support ${displayName} on Kiima`, url: profileUrl });
      } catch {
        // dismissed
      }
    } else {
      try {
        await navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // no-op
      }
    }
  }

  return (
    <div style={cardStyle}>
      {/* Avatar */}
      <div style={avatarStyle}>
        {avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
        ) : (
          <span style={initialStyle}>{initial}</span>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={nameStyle}>{displayName}</p>
        <p style={usernameStyle}>kiima.app/{username}</p>
        {bio && <p style={bioStyle}>{bio}</p>}
      </div>

      {/* Share CTA */}
      <button onClick={handleShare} style={shareBtnStyle}>
        {copied ? 'Copied!' : 'Share page'}
      </button>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background:   '#ffffff',
  borderRadius: 16,
  border:       '1px solid #EBEBEB',
  padding:      28,
  display:      'flex',
  alignItems:   'center',
  gap:          16,
};

const avatarStyle: React.CSSProperties = {
  width:        56,
  height:       56,
  borderRadius: '50%',
  background:   '#1C1916',
  display:      'flex',
  alignItems:   'center',
  justifyContent: 'center',
  overflow:     'hidden',
  flexShrink:   0,
};

const initialStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize:   22,
  color:      '#ffffff',
  lineHeight: 1,
  userSelect: 'none',
};

const nameStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize:   16,
  color:      '#1C1916',
  margin:     0,
  overflow:   'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const usernameStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize:   13,
  color:      '#9A9089',
  margin:     '3px 0 0',
  overflow:   'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const bioStyle: React.CSSProperties = {
  fontFamily:        'var(--font-body)',
  fontSize:          13,
  color:             '#5A4D44',
  margin:            '6px 0 0',
  overflow:          'hidden',
  display:           '-webkit-box',
  WebkitLineClamp:   2,
  WebkitBoxOrient:   'vertical',
  lineHeight:        1.5,
};

const shareBtnStyle: React.CSSProperties = {
  fontFamily:   'var(--font-body)',
  fontWeight:   600,
  fontSize:     13,
  color:        '#C87B5C',
  background:   '#FDF1EC',
  border:       'none',
  borderRadius: 100,
  padding:      '10px 18px',
  cursor:       'pointer',
  whiteSpace:   'nowrap',
  flexShrink:   0,
  transition:   'background 0.15s ease',
};
