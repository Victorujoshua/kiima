'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface Props {
  username: string;
}

export default function LinkBar({ username }: Props) {
  const [copied, setCopied] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kiima.co';
  const fullUrl = `${appUrl}/${username}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <div style={barStyle}>
      <span style={urlStyle}>kiima.co/{username}</span>
      <button onClick={handleCopy} style={copyBtnStyle} aria-label="Copy link">
        {copied ? (
          <Check size={16} color="var(--color-success)" />
        ) : (
          <Copy size={16} />
        )}
      </button>
    </div>
  );
}

const barStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--shadow-card)',
  padding: '12px var(--space-md)',
  marginBottom: 'var(--space-md)',
};

const urlStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-accent)',
  fontWeight: 500,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const copyBtnStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  border: 'none',
  background: 'transparent',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: 'var(--color-text-muted)',
  transition: 'color 0.15s ease',
  borderRadius: 'var(--radius-sm)',
  flexShrink: 0,
};
