'use client';

import { useState } from 'react';
import { updateProfileDirect } from '@/lib/actions/auth.actions';

interface Props {
  userId: string;
  initialEmbedUrl: string;
}

type Status = 'idle' | 'saving' | 'saved' | 'error';

const SUPPORTED_HINT = 'YouTube, Twitter/X, or Spotify links only.';

function validateEmbedUrl(url: string): string | null {
  if (!url) return null; // empty = clear embed, always valid
  if (!url.startsWith('https://')) return 'URL must begin with https://';

  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
  const isTwitter = url.includes('twitter.com') || url.includes('x.com');
  const isSpotify = url.includes('open.spotify.com');

  if (!isYouTube && !isTwitter && !isSpotify) {
    return `Unsupported source. ${SUPPORTED_HINT}`;
  }
  return null;
}

export default function EmbedSection({ userId, initialEmbedUrl }: Props) {
  const [value, setValue]   = useState(initialEmbedUrl);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSave() {
    const trimmed = value.trim();
    const validationError = validateEmbedUrl(trimmed);
    if (validationError) {
      setStatus('error');
      setErrorMsg(validationError);
      return;
    }

    setStatus('saving');
    setErrorMsg('');

    const result = await updateProfileDirect(userId, { embed_url: trimmed || null });
    if (result.error) {
      setStatus('error');
      setErrorMsg(result.error);
    } else {
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

  return (
    <div style={cardStyle}>
      <p style={titleStyle}>Embed</p>
      <p style={subtitleStyle}>
        Pin a YouTube video, tweet, or Spotify track to the top of your page.
      </p>

      <div style={{ position: 'relative', marginTop: 16 }}>
        <input
          type="url"
          value={value}
          onChange={e => {
            setValue(e.target.value);
            if (status !== 'idle') setStatus('idle');
          }}
          placeholder="https://youtube.com/watch?v=…"
          style={inputStyle(status === 'error')}
        />
        {value && (
          <button
            type="button"
            onClick={() => { setValue(''); if (status !== 'idle') setStatus('idle'); }}
            style={clearBtnStyle}
            title="Clear embed"
          >
            ×
          </button>
        )}
      </div>

      {status === 'error' && (
        <p style={errorStyle}>{errorMsg}</p>
      )}

      <p style={hintStyle}>{SUPPORTED_HINT}</p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 16, gap: 12 }}>
        {status === 'saved' && <span style={successStyle}>Saved ✓</span>}
        <button
          type="button"
          onClick={handleSave}
          disabled={status === 'saving'}
          style={saveBtnStyle(status === 'saving')}
        >
          {status === 'saving' ? 'Saving…' : value.trim() ? 'Save embed' : 'Remove embed'}
        </button>
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: 16,
  border: '1px solid #EBEBEB',
  padding: 28,
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 15,
  color: '#1C1916',
  margin: 0,
};

const subtitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#9A9089',
  margin: '6px 0 0',
};

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    width: '100%',
    height: 48,
    border: `1.5px solid ${hasError ? '#E07070' : '#EBEBEB'}`,
    borderRadius: 12,
    background: '#ffffff',
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    color: '#1C1916',
    padding: '0 48px 0 14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease',
  };
}

const clearBtnStyle: React.CSSProperties = {
  position: 'absolute',
  right: 14,
  top: '50%',
  transform: 'translateY(-50%)',
  width: 24,
  height: 24,
  border: 'none',
  background: '#F4F4F4',
  borderRadius: '50%',
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  fontSize: 16,
  color: '#9A9089',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 1,
  padding: 0,
};

const hintStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 12,
  color: '#B5AAAA',
  margin: '8px 0 0',
};

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#E07070',
  margin: '6px 0 0',
};

const successStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#3D9B56',
};

function saveBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    fontFamily: 'var(--font-body)',
    fontWeight: 700,
    fontSize: 14,
    color: disabled ? '#9A9089' : '#000000',
    background: disabled ? '#F4F4F4' : '#D7D744',
    border: 'none',
    borderRadius: 100,
    padding: '10px 24px',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}
