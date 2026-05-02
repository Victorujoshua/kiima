'use client';

import { useState } from 'react';
import { updateProfileDirect } from '@/lib/actions/auth.actions';

interface Props {
  userId: string;
  initialValue: boolean;
}

export default function ShowContributionsSection({ userId, initialValue }: Props) {
  const [enabled, setEnabled]   = useState(initialValue);
  const [saving, setSaving]     = useState(false);
  const [flash, setFlash]       = useState<'saved' | 'error' | null>(null);

  async function toggle() {
    const next = !enabled;
    setEnabled(next);
    setSaving(true);
    setFlash(null);

    const result = await updateProfileDirect(userId, { show_contributions: next });

    setSaving(false);
    if (result.error) {
      setEnabled(!next); // revert
      setFlash('error');
    } else {
      setFlash('saved');
      setTimeout(() => setFlash(null), 2500);
    }
  }

  return (
    <div style={cardStyle}>
      <div style={rowStyle}>
        <div style={textColStyle}>
          <p style={titleStyle}>Show supporters</p>
          <p style={subtitleStyle}>
            {enabled
              ? 'Gifters can see who has supported you'
              : 'Supporter list is hidden on your gift page'}
          </p>
        </div>

        <div style={rightColStyle}>
          {flash === 'saved' && <span style={savedStyle}>Saved ✓</span>}
          {flash === 'error' && <span style={errorStyle}>Error — try again</span>}

          <button
            type="button"
            onClick={toggle}
            disabled={saving}
            aria-pressed={enabled}
            aria-label="Toggle supporter visibility"
            style={switchTrackStyle(enabled, saving)}
          >
            <span style={switchThumbStyle(enabled)} />
          </button>
        </div>
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

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
};

const textColStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const rightColStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  flexShrink: 0,
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
  margin: 0,
};

function switchTrackStyle(on: boolean, disabled: boolean): React.CSSProperties {
  return {
    width: 48,
    height: 28,
    borderRadius: 100,
    background: on ? '#D7D744' : '#E5E5E5',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: 3,
    display: 'flex',
    alignItems: 'center',
    transition: 'background 0.18s ease',
    opacity: disabled ? 0.6 : 1,
    flexShrink: 0,
    position: 'relative',
  };
}

function switchThumbStyle(on: boolean): React.CSSProperties {
  return {
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: '#000000',
    transition: 'transform 0.18s ease',
    transform: on ? 'translateX(20px)' : 'translateX(0)',
    flexShrink: 0,
  };
}

const savedStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#3D9B56',
};

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#E07070',
};
