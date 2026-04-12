'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { closePool } from '@/lib/actions/pool.actions';
import KiimaButton from '@/components/shared/KiimaButton';

interface ClosePoolButtonProps {
  poolId: string;
  userId: string;
}

export default function ClosePoolButton({ poolId, userId }: ClosePoolButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  async function handleConfirm() {
    setClosing(true);
    setError(null);
    const result = await closePool(poolId, userId);
    if (result.error) {
      setError(result.error);
      setConfirming(false);
      setClosing(false);
    } else {
      // Refresh the Server Component so the closed state renders
      startTransition(() => router.refresh());
    }
  }

  if (confirming) {
    return (
      <div style={confirmWrapStyle}>
        <p style={confirmTextStyle}>
          Are you sure? This cannot be undone. Supporters will no longer be able to contribute.
        </p>
        <div style={confirmActionsStyle}>
          <KiimaButton
            variant="danger"
            loading={closing}
            disabled={closing}
            onClick={handleConfirm}
          >
            Yes, close pool
          </KiimaButton>
          <KiimaButton
            variant="ghost"
            disabled={closing}
            onClick={() => { setConfirming(false); setError(null); }}
          >
            Cancel
          </KiimaButton>
        </div>
        {error && (
          <p style={errorStyle} role="alert">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <KiimaButton variant="danger" onClick={() => setConfirming(true)}>
        Close pool
      </KiimaButton>
      <p style={hintStyle}>
        Once closed, supporters can no longer contribute. History stays visible.
      </p>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const confirmWrapStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-md)',
};

const confirmTextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-secondary)',
  lineHeight: 1.6,
  margin: 0,
};

const confirmActionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--space-sm)',
  flexWrap: 'wrap',
};

const hintStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  color: 'var(--color-text-muted)',
  margin: 'var(--space-xs) 0 0',
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
