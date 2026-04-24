'use client';

import Image from 'next/image';
import { Share2 } from 'lucide-react';

interface Props {
  avatarUrl: string | null;
  displayName: string;
  username: string;
}

export default function DashboardHeader({ avatarUrl, displayName, username }: Props) {
  const initial = displayName.charAt(0).toUpperCase() || '?';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kiima.co';
  const link = `${appUrl}/${username}`;

  async function handleShare() {
    if (typeof navigator === 'undefined') return;
    const data = {
      title: `Support ${displayName} on Kiima`,
      text: `Send a gift to ${displayName}`,
      url: link,
    };
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        // user dismissed — no-op
      }
    } else {
      try {
        await navigator.clipboard.writeText(link);
      } catch {
        // clipboard unavailable — no-op
      }
    }
  }

  return (
    <div style={wrapStyle}>
      <div style={avatarWrapStyle}>
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={40}
            height={40}
            style={{ borderRadius: '50%', objectFit: 'cover', width: '100%', height: '100%' }}
          />
        ) : (
          <span style={initStyle}>{initial}</span>
        )}
      </div>

      <button onClick={handleShare} style={shareBtnStyle} aria-label="Share my Kiima link">
        <Share2 size={18} strokeWidth={2} />
      </button>
    </div>
  );
}

const wrapStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 'var(--space-md)',
};

const avatarWrapStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: 'var(--color-accent)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  flexShrink: 0,
};

const initStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '16px',
  color: '#ffffff',
  lineHeight: 1,
  userSelect: 'none',
};

const shareBtnStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: 'var(--color-text-secondary)',
  transition: 'all 0.15s ease',
  flexShrink: 0,
};
