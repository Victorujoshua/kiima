'use client';

import { useState } from 'react';

interface CopyPoolLinkProps {
  url: string;
  display: string;
}

export default function CopyPoolLink({ url, display }: CopyPoolLinkProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — silently fail
    }
  }

  return (
    <div style={wrapStyle}>
      <span style={urlStyle}>{display}</span>
      <button
        type="button"
        onClick={handleCopy}
        style={copied ? copiedBtnStyle : copyBtnStyle}
      >
        {copied ? 'Copied! ✓' : 'Copy link'}
      </button>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const wrapStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-xs)',
  flexWrap: 'wrap',
};

const urlStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  color: 'var(--color-text-faint)',
};

const baseBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '11px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-full)',
  padding: '2px 10px',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  background: 'none',
  flexShrink: 0,
};

const copyBtnStyle: React.CSSProperties = {
  ...baseBtnStyle,
  color: 'var(--color-accent)',
};

const copiedBtnStyle: React.CSSProperties = {
  ...baseBtnStyle,
  color: 'var(--color-success)',
  borderColor: 'var(--color-success-soft)',
  background: 'var(--color-success-soft)',
  cursor: 'default',
};
