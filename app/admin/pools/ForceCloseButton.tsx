'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { forceClosePool } from '@/lib/actions/admin.actions';

interface Props {
  poolId: string;
}

export default function ForceCloseButton({ poolId }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleConfirm() {
    setError(null);
    const result = await forceClosePool(poolId);
    if (result.error) {
      setError(result.error);
      setConfirming(false);
      return;
    }
    setConfirming(false);
    startTransition(() => router.refresh());
  }

  if (!confirming) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            fontWeight: 600,
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-danger)',
            background: 'var(--color-danger-soft)',
            color: 'var(--color-danger)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'opacity 0.15s ease',
          }}
        >
          Force close
        </button>
        {error && (
          <div
            style={{
              marginTop: 4,
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--color-danger)',
            }}
          >
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          color: 'var(--color-text-secondary)',
        }}
      >
        Close this pool?
      </span>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={isPending}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          fontWeight: 600,
          padding: '5px 12px',
          borderRadius: 'var(--radius-full)',
          border: 'none',
          background: 'var(--color-danger)',
          color: '#fff',
          cursor: isPending ? 'not-allowed' : 'pointer',
          opacity: isPending ? 0.7 : 1,
          whiteSpace: 'nowrap',
        }}
      >
        {isPending ? 'Closing…' : 'Confirm'}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={isPending}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          fontWeight: 600,
          padding: '5px 12px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          color: 'var(--color-text-secondary)',
          cursor: isPending ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Cancel
      </button>
    </div>
  );
}
