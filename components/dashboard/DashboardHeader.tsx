'use client';

import { useState } from 'react';
import { Share2, Copy, UserCircle } from 'lucide-react';

interface DashboardHeaderProps {
  displayName: string;
  username: string;
  avatarUrl: string | null;
}

export default function DashboardHeader({ displayName, username, avatarUrl }: DashboardHeaderProps) {
  const [copied, setCopied] = useState(false);
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
      {/* Row 1: avatar + share icon */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={avatarCircleStyle}>
          {avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={avatarUrl}
              alt={displayName}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <UserCircle size={56} strokeWidth={1.5} color="#C4BCBA" />
          )}
        </div>

        <button onClick={handleShare} style={shareStyle} aria-label="Share my Kiima link">
          <Share2 size={24} strokeWidth={1.75} />
        </button>
      </div>

      {/* Row 2: display name */}
      <p style={nameStyle}>{displayName}</p>

      {/* Row 3: link + copy icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
        <span style={linkStyle}>{displayLink}</span>
        <button onClick={handleCopy} style={copyBtnStyle} aria-label="Copy link">
          <Copy size={16} strokeWidth={2} />
        </button>
        {copied && <span style={tooltipStyle}>Copied!</span>}
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
  width: '56px',
  height: '56px',
  borderRadius: '50%',
  overflow: 'hidden',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
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
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '24px',
  color: 'var(--color-text-primary)',
  margin: '16px 0 4px',
  lineHeight: 1.2,
};

const linkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 400,
  fontSize: '16px',
  color: 'var(--color-text-primary)',
  lineHeight: 1,
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
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '12px',
  color: 'var(--color-surface)',
  background: 'var(--color-text-primary)',
  borderRadius: 'var(--radius-full)',
  padding: '3px 10px',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
};
