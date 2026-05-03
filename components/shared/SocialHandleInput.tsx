'use client';

import { useRef, useEffect } from 'react';

export type SocialPlatformOption = 'instagram' | 'twitter' | 'tiktok';

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  selectedPlatform: SocialPlatformOption;
  onPlatformChange: (p: SocialPlatformOption) => void;
  dropdownOpen: boolean;
  onDropdownToggle: () => void;
  onDropdownClose: () => void;
}

const PLATFORMS: { id: SocialPlatformOption; label: string }[] = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'twitter',   label: 'X / Twitter' },
  { id: 'tiktok',    label: 'TikTok' },
];

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.95a8.16 8.16 0 004.77 1.52V8.03a4.85 4.85 0 01-1-.34z" />
    </svg>
  );
}

export function PlatformIcon({ platform }: { platform: SocialPlatformOption }) {
  if (platform === 'instagram') return <InstagramIcon />;
  if (platform === 'twitter') return <TwitterIcon />;
  return <TikTokIcon />;
}

export default function SocialHandleInput({
  value, onChange, disabled,
  selectedPlatform, onPlatformChange,
  dropdownOpen, onDropdownToggle, onDropdownClose,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const showSocialPicker = value.startsWith('@');

  // Close dropdown when social picker hides (user deleted the @)
  useEffect(() => {
    if (!showSocialPicker && dropdownOpen) {
      onDropdownClose();
    }
  }, [showSocialPicker, dropdownOpen, onDropdownClose]);

  // Close on click-outside when dropdown is open
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        onDropdownClose();
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [dropdownOpen, onDropdownClose]);

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      {/* Compound input row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        border: '1.5px solid rgba(28,25,22,0.1)',
        borderRadius: '14px',
        background: disabled ? '#F6F3EE' : '#ffffff',
        backgroundColor: disabled ? '#F6F3EE' : '#ffffff',
        overflow: 'hidden',
        transition: 'border-color 0.15s ease',
        colorScheme: 'light',
      }}>
        {/* Platform picker — only shown when value starts with @ */}
        {showSocialPicker && (
          <button
            type="button"
            onClick={onDropdownToggle}
            disabled={disabled}
            aria-expanded={dropdownOpen}
            aria-label="Select platform"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '0 10px',
              height: '48px',
              background: 'transparent',
              border: 'none',
              borderRight: '1.5px solid var(--color-border)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              color: 'var(--color-text-secondary)',
              flexShrink: 0,
            }}
          >
            <PlatformIcon platform={selectedPlatform} />
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}

        {/* Text input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={showSocialPicker ? 'yourusername' : 'Name or @yoursocial'}
          disabled={disabled}
          style={{
            flex: 1,
            height: '48px',
            border: 'none',
            background: 'transparent',
            backgroundColor: 'transparent',
            fontFamily: 'var(--font-body)',
            fontSize: '15px',
            color: disabled ? '#9A9089' : '#1C1916',
            padding: '0 14px',
            outline: 'none',
            colorScheme: 'light',
          }}
        />
      </div>

      {/* Dropdown — only rendered when social picker is visible */}
      {showSocialPicker && dropdownOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          background: '#ffffff',
          backgroundColor: '#ffffff',
          border: '1px solid rgba(28,25,22,0.08)',
          borderRadius: '14px',
          boxShadow: '0 6px 28px rgba(28,25,22,0.09)',
          zIndex: 50,
          minWidth: '160px',
          overflow: 'hidden',
          colorScheme: 'light',
        }}>
          {PLATFORMS.map((p) => {
            const active = selectedPlatform === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => { onPlatformChange(p.id); onDropdownClose(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '12px 14px',
                  background: active ? 'var(--color-accent-soft)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: active ? 'var(--color-accent)' : 'var(--color-text-primary)',
                  textAlign: 'left',
                  transition: 'background 0.1s ease',
                }}
              >
                <PlatformIcon platform={p.id} />
                {p.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
