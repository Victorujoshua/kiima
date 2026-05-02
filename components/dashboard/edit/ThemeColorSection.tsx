'use client';

import { useState } from 'react';
import { updateProfileDirect } from '@/lib/actions/auth.actions';

interface Props {
  userId: string;
  initialColor: string;
  onChange: (color: string) => void;
}

type Status = 'idle' | 'saving' | 'saved' | 'error';

const SWATCHES = [
  { hex: '#C87B5C', name: 'Terracotta' },
  { hex: '#D7D744', name: 'Kiima Yellow' },
  { hex: '#3D9B56', name: 'Forest Green' },
  { hex: '#5B8FE8', name: 'Sky Blue' },
  { hex: '#9B5BE8', name: 'Purple' },
  { hex: '#E85B8F', name: 'Pink' },
];

export default function ThemeColorSection({ userId, initialColor, onChange }: Props) {
  const [selected, setSelected] = useState(initialColor || '#C87B5C');
  const [showCustom, setShowCustom] = useState(
    !SWATCHES.some(s => s.hex.toLowerCase() === (initialColor || '').toLowerCase())
  );
  const [status, setStatus]   = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function pickSwatch(hex: string) {
    setSelected(hex);
    setShowCustom(false);
    onChange(hex);
  }

  function pickCustom(hex: string) {
    setSelected(hex);
    onChange(hex);
  }

  const isPreset = SWATCHES.some(s => s.hex.toLowerCase() === selected.toLowerCase());

  async function handleSave() {
    setStatus('saving');
    setErrorMsg('');
    const result = await updateProfileDirect(userId, { theme_color: selected });
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
      <p style={titleStyle}>Theme color</p>
      <p style={subtitleStyle}>Accent colour shown on your gift page</p>

      {/* Swatches row */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        {SWATCHES.map(s => {
          const active = selected.toLowerCase() === s.hex.toLowerCase();
          return (
            <button
              key={s.hex}
              type="button"
              title={s.name}
              onClick={() => pickSwatch(s.hex)}
              style={swatchStyle(s.hex, active)}
            >
              {active && <CheckIcon />}
            </button>
          );
        })}
        {/* Custom pill */}
        <button
          type="button"
          onClick={() => setShowCustom(v => !v)}
          style={customPillStyle(!isPreset)}
        >
          {isPreset ? 'Custom' : selected.toUpperCase()}
        </button>
      </div>

      {/* Native color picker */}
      {showCustom && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <input
            type="color"
            value={selected}
            onChange={e => pickCustom(e.target.value)}
            style={{ width: 48, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 2 }}
          />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#5A4D44', fontWeight: 600 }}>
            {selected.toUpperCase()}
          </span>
        </div>
      )}

      {/* Preview strip */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#B5AAAA', margin: '0 0 10px' }}>
          Preview
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={previewPillStyle(selected)}>Buy me a drink 🥤</div>
          <div style={previewPillStyle(selected, true)}>Buy me a coffee ☕</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
        {status === 'saved' && <span style={successStyle}>Saved ✓</span>}
        {status === 'error'  && <span style={errorStyle}>{errorMsg}</span>}
        <button
          type="button"
          onClick={handleSave}
          disabled={status === 'saving'}
          style={saveBtnStyle(status === 'saving')}
        >
          {status === 'saving' ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function swatchStyle(hex: string, active: boolean): React.CSSProperties {
  return {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: hex,
    border: active ? `3px solid ${hex}` : '3px solid transparent',
    outline: active ? `2px solid ${hex}` : 'none',
    outlineOffset: 2,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };
}

function customPillStyle(active: boolean): React.CSSProperties {
  return {
    fontFamily: 'var(--font-body)',
    fontWeight: active ? 700 : 500,
    fontSize: 13,
    color: active ? '#000000' : '#5A4D44',
    background: active ? '#F0F0F0' : '#F4F4F4',
    border: active ? '1.5px solid #1C1916' : '1.5px solid #EBEBEB',
    borderRadius: 100,
    padding: '7px 16px',
    cursor: 'pointer',
  };
}

function previewPillStyle(color: string, muted = false): React.CSSProperties {
  return {
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    fontSize: 13,
    color: muted ? color : '#ffffff',
    background: muted ? `${color}18` : color,
    border: muted ? `1.5px solid ${color}40` : 'none',
    borderRadius: 100,
    padding: '8px 16px',
    display: 'inline-block',
  };
}

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
  margin: '0 0 4px',
};

const subtitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#9A9089',
  margin: '0 0 20px',
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

const successStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#3D9B56',
};

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#E07070',
};
