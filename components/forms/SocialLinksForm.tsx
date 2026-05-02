'use client';

import { useState } from 'react';
import type { SocialLink, SocialPlatform } from '@/types';
import { upsertSocialLink } from '@/lib/actions/link.actions';

interface Props {
  userId: string;
  existingLinks: SocialLink[];
  noCard?: boolean;
}

const PLATFORMS: { key: SocialPlatform; label: string; placeholder: string }[] = [
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourhandle'   },
  { key: 'tiktok',   label: 'TikTok',    placeholder: 'https://tiktok.com/@yourhandle'     },
  { key: 'twitter',  label: 'Twitter / X', placeholder: 'https://x.com/yourhandle'         },
  { key: 'youtube',  label: 'YouTube',   placeholder: 'https://youtube.com/@yourchannel'   },
  { key: 'linkedin', label: 'LinkedIn',  placeholder: 'https://linkedin.com/in/yourprofile'},
  { key: 'website',  label: 'Website',   placeholder: 'https://yourwebsite.com'            },
];

// Small decorative platform icons for each row label
function PlatformIcon({ platform }: { platform: SocialPlatform }) {
  const style: React.CSSProperties = { flexShrink: 0, color: 'var(--color-text-muted)' };
  switch (platform) {
    case 'instagram':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={style} aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.95a8.16 8.16 0 004.77 1.52V8.03a4.85 4.85 0 01-1-.34z" />
        </svg>
      );
    case 'twitter':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={style} aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={style} aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={style} aria-hidden="true">
          <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );
    case 'website':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
      );
  }
}

type RowStatus = 'idle' | 'saving' | 'saved' | 'error';

interface LinkRowProps {
  userId: string;
  platform: SocialPlatform;
  label: string;
  placeholder: string;
  initialUrl: string;
}

function LinkRow({ userId, platform, label, placeholder, initialUrl }: LinkRowProps) {
  const [url, setUrl] = useState(initialUrl);
  const [status, setStatus] = useState<RowStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSave() {
    setStatus('saving');
    setErrorMsg('');
    const result = await upsertSocialLink(userId, platform, url);
    if (result.error) {
      setStatus('error');
      setErrorMsg(result.error);
    } else {
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2500);
    }
  }

  return (
    <div
      style={{
        padding: '16px 0',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="k-link-row-content">
        {/* Icon + label */}
        <div className="k-link-platform-col">
          <PlatformIcon platform={platform} />
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </span>
        </div>

        {/* URL input */}
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (status !== 'idle') setStatus('idle');
          }}
          placeholder={placeholder}
          style={{
            flex: 1,
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--color-text-primary)',
            background: 'var(--color-bg)',
            border: '1.5px solid #EBEBEB',
            borderRadius: 12,
            padding: '10px 14px',
            outline: 'none',
            transition: 'border-color 0.15s ease, background 0.15s ease',
            minWidth: 0,
            minHeight: '44px',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-accent)';
            e.currentTarget.style.background = '#fff';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.background = 'var(--color-bg)';
          }}
        />

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={status === 'saving'}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            fontWeight: 600,
            padding: '10px 18px',
            minHeight: '44px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 100,
            border: 'none',
            background: status === 'saved'
              ? 'var(--color-success-soft)'
              : 'var(--color-text-primary)',
            color: status === 'saved' ? 'var(--color-success)' : '#fff',
            cursor: status === 'saving' ? 'not-allowed' : 'pointer',
            opacity: status === 'saving' ? 0.7 : 1,
            flexShrink: 0,
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved ✓' : 'Save'}
        </button>
      </div>

      {/* Inline error */}
      {status === 'error' && errorMsg && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--color-danger)',
            margin: '6px 0 0',
          }}
        >
          {errorMsg}
        </p>
      )}
    </div>
  );
}

export default function SocialLinksForm({ userId, existingLinks, noCard }: Props) {
  const existingByPlatform: Partial<Record<SocialPlatform, string>> = {};
  for (const link of existingLinks) {
    existingByPlatform[link.platform] = link.url;
  }

  const rows = (
    <>
      <style>{`.k-social-last { border-bottom: none !important; }`}</style>
      {PLATFORMS.map(({ key, label, placeholder }, i) => (
        <div key={key} className={i === PLATFORMS.length - 1 ? 'k-social-last' : ''}>
          <LinkRow
            userId={userId}
            platform={key}
            label={label}
            placeholder={placeholder}
            initialUrl={existingByPlatform[key] ?? ''}
          />
        </div>
      ))}
    </>
  );

  if (noCard) return <div>{rows}</div>;

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 16,
        border: '1px solid #EBEBEB',
        padding: 28,
      }}
    >
      {rows}
    </div>
  );
}
