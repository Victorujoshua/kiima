'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { suspendCreator, unsuspendCreator } from '@/lib/actions/admin.actions';

interface Props {
  creatorId: string;
  isSuspended: boolean;
}

export default function SuspendButton({ creatorId, isSuspended }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleConfirm() {
    setError(null);
    const result = isSuspended
      ? await unsuspendCreator(creatorId)
      : await suspendCreator(creatorId);

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
            fontSize: '14px',
            fontWeight: 600,
            padding: '10px 20px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer',
            background: isSuspended ? 'var(--color-success-soft)' : 'var(--color-danger-soft)',
            color: isSuspended ? 'var(--color-success)' : 'var(--color-danger)',
            transition: 'opacity 0.15s ease',
          }}
        >
          {isSuspended ? 'Unsuspend account' : 'Suspend account'}
        </button>
        {error && (
          <div
            style={{
              marginTop: 8,
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: '16px',
        background: isSuspended ? 'var(--color-success-soft)' : 'var(--color-danger-soft)',
        borderRadius: 'var(--radius-sm)',
        maxWidth: 400,
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          color: 'var(--color-text-primary)',
          margin: 0,
        }}
      >
        {isSuspended
          ? `This will restore the creator's gift page and dashboard access.`
          : `This will block the creator's public gift page from loading. Their data is preserved.`}
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isPending}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 600,
            padding: '9px 18px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: isPending ? 'not-allowed' : 'pointer',
            background: isSuspended ? 'var(--color-success)' : 'var(--color-danger)',
            color: '#fff',
            opacity: isPending ? 0.7 : 1,
            transition: 'opacity 0.15s ease',
          }}
        >
          {isPending
            ? 'Working…'
            : isSuspended
            ? 'Yes, unsuspend'
            : 'Yes, suspend'}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={isPending}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 600,
            padding: '9px 18px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            cursor: isPending ? 'not-allowed' : 'pointer',
            background: 'var(--color-surface)',
            color: 'var(--color-text-secondary)',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
