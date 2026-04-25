'use client';

import { useState } from 'react';
import { Share2, Copy } from 'lucide-react';

interface DashboardHeaderProps {
  displayName: string;
  username: string;
  avatarUrl: string | null;
}

export default function DashboardHeader({ displayName, username, avatarUrl }: DashboardHeaderProps) {
  const [copied, setCopied] = useState(false);
  // IMPORTANT: NEXT_PUBLIC_APP_URL must be set to https://kiima.app
  // in Vercel dashboard → Project → Settings → Environment Variables (Production).
  // Without this, the copy URL will use the Vercel deployment URL instead.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kiima.app';
  const link = `${appUrl}/${username}`;
  const displayLink = `kiima.app/${username}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  async function handleShare() {
    if (typeof navigator === 'undefined') return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Support ${displayName} on Kiima`,
          text: `Send a gift to ${displayName}`,
          url: link,
        });
      } catch {
        // user dismissed — no-op
      }
    } else {
      handleCopy();
    }
  }

  return (
    <div style={wrapStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Avatar */}
        <div style={avatarCircleStyle}>
          {avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={avatarUrl}
              alt={displayName}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <span style={initialStyle}>
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Name + link */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={nameStyle}>{displayName}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
            <span style={linkStyle}>{displayLink}</span>
            <button onClick={handleCopy} style={copyBtnStyle} aria-label="Copy link">
              <Copy size={14} strokeWidth={2} />
            </button>
            {copied && <span style={tooltipStyle}>Copied!</span>}
          </div>
        </div>

        {/* Share */}
        <button onClick={handleShare} style={shareStyle} aria-label="Share my Kiima link">
          <Share2 size={22} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const wrapStyle: React.CSSProperties = {
  background: 'var(--color-bg)',
  paddingBottom: '20px',
};

const avatarCircleStyle: React.CSSProperties = {
  width: '52px',
  height: '52px',
  borderRadius: '50%',
  overflow: 'hidden',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--color-accent)',
};

const initialStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontWeight: 800,
  fontSize: '22px',
  color: '#ffffff',
  lineHeight: 1,
  userSelect: 'none',
};

const shareStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: '4px',
  cursor: 'pointer',
  color: 'var(--color-text-primary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'var(--radius-sm)',
  transition: 'opacity 0.15s ease',
};

const nameStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontWeight: 700,
  fontSize: '18px',
  color: 'var(--color-text-primary)',
  margin: '0 0 3px',
  lineHeight: 1.2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const linkStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontWeight: 400,
  fontSize: '13px',
  color: 'var(--color-text-muted)',
  lineHeight: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const copyBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: '2px',
  cursor: 'pointer',
  color: 'var(--color-text-muted)',
  display: 'flex',
  alignItems: 'center',
  transition: 'color 0.15s ease',
};

const tooltipStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontWeight: 600,
  fontSize: '12px',
  color: 'var(--color-surface)',
  background: 'var(--color-text-primary)',
  borderRadius: 'var(--radius-full)',
  padding: '3px 10px',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
};
