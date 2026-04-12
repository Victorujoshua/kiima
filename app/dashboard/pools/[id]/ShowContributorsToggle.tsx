'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateShowContributors } from '@/lib/actions/pool.actions';

interface ShowContributorsToggleProps {
  poolId: string;
  userId: string;
  initialValue: boolean;
}

export default function ShowContributorsToggle({
  poolId,
  userId,
  initialValue,
}: ShowContributorsToggleProps) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  async function handleToggle() {
    const next = !value;
    setValue(next); // Optimistic update
    setError(null);

    const result = await updateShowContributors(poolId, userId, next);
    if (result.error) {
      setValue(value); // Revert on failure
      setError(result.error);
    } else {
      startTransition(() => router.refresh());
    }
  }

  return (
    <div style={wrapStyle}>
      <div style={rowStyle}>
        <div>
          <span style={labelStyle}>Show recent contributors publicly</span>
          <p style={descStyle}>
            When on, anyone visiting your pool page can see who has contributed
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={value}
          aria-label="Toggle show contributors"
          onClick={handleToggle}
          style={{
            width: '44px',
            height: '24px',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            background: value ? 'var(--color-accent)' : 'rgba(28, 25, 22, 0.14)',
            transition: 'background 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: value ? 'flex-end' : 'flex-start',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#ffffff',
              boxShadow: '0 1px 4px rgba(28, 25, 22, 0.20)',
              display: 'block',
              flexShrink: 0,
            }}
          />
        </button>
      </div>
      {error && (
        <p style={errorStyle} role="alert">{error}</p>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const wrapStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-sm)',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 'var(--space-md)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '13px',
  color: 'var(--color-text-primary)',
  marginBottom: '2px',
};

const descStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  color: 'var(--color-text-muted)',
  margin: 0,
  lineHeight: 1.5,
};

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--color-danger)',
  background: 'var(--color-danger-soft)',
  borderRadius: 'var(--radius-sm)',
  padding: '10px var(--space-md)',
  margin: 0,
};
