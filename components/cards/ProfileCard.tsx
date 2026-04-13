'use client';

import { useState } from 'react';
import type { Profile, SocialLink } from '@/types';
import SocialLinksRow from '@/components/shared/SocialLinksRow';

interface ProfileCardProps {
  profile: Profile;
  showLinkBar?: boolean;
  links?: SocialLink[];
}

export default function ProfileCard({ profile, showLinkBar = false, links = [] }: ProfileCardProps) {
  const [copied, setCopied] = useState(false);
  const linkDisplay = `kiima.co/${profile.username}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`https://${linkDisplay}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silent fail
    }
  }

  // Two-letter initials fallback
  const initials = profile.display_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={cardStyle}>
      {/* Avatar */}
      <div style={avatarWrapStyle}>
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.display_name}
            style={avatarImgStyle}
          />
        ) : (
          <div style={avatarFallbackStyle} aria-hidden="true">
            {initials}
          </div>
        )}
      </div>

      {/* Display name */}
      <h1 style={nameStyle}>{profile.display_name}</h1>

      {/* Username */}
      <p style={usernameStyle}>@{profile.username}</p>

      {/* Bio */}
      {profile.bio && <p style={bioStyle}>{profile.bio}</p>}

      {/* Copy-link bar — only shown when showLinkBar=true (dashboard context) */}
      {showLinkBar && (
        <button
          type="button"
          onClick={handleCopy}
          style={copyBarStyle}
          aria-label={copied ? 'Link copied!' : `Copy link: ${linkDisplay}`}
        >
          <span style={linkTextStyle}>{linkDisplay}</span>
          <span style={copyLabelStyle}>{copied ? 'Copied!' : 'Copy link'}</span>
        </button>
      )}

      {/* Social link icons — only rendered when links exist */}
      {links.length > 0 && <SocialLinksRow links={links} />}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--shadow-card)',
  padding: 'var(--space-xl)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: 'var(--space-sm)',
};

const avatarWrapStyle: React.CSSProperties = {
  marginBottom: 'var(--space-xs)',
};

const avatarImgStyle: React.CSSProperties = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  objectFit: 'cover',
};

const avatarFallbackStyle: React.CSSProperties = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  background: 'var(--color-accent-soft)',
  color: 'var(--color-accent)',
  fontFamily: 'var(--font-display)',
  fontWeight: 500,
  fontSize: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const nameStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 500,
  fontSize: '26px',
  color: 'var(--color-text-primary)',
  margin: 0,
};

const usernameStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 400,
  fontSize: '14px',
  color: 'var(--color-text-muted)',
  margin: 0,
};

const bioStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 400,
  fontSize: '14px',
  lineHeight: 1.65,
  color: 'var(--color-text-secondary)',
  margin: '4px 0 0',
  maxWidth: '280px',
};

const copyBarStyle: React.CSSProperties = {
  marginTop: 'var(--space-md)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--space-sm)',
  width: '100%',
  minHeight: '44px',
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-full)',
  padding: '10px var(--space-md)',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

const linkTextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 500,
  fontSize: '13px',
  color: 'var(--color-text-secondary)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const copyLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '12px',
  color: 'var(--color-accent)',
  flexShrink: 0,
};
