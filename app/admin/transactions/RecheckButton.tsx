'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { recheckPaystackPayment } from '@/lib/actions/admin.actions';

interface Props {
  paystackRef: string;
}

export default function RecheckButton({ paystackRef }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleRecheck() {
    setMessage(null);
    const result = await recheckPaystackPayment(paystackRef);

    if (result.alreadyConfirmed) {
      setIsError(false);
      setMessage('Already confirmed.');
      startTransition(() => router.refresh());
      return;
    }
    if (result.confirmed) {
      setIsError(false);
      setMessage('Confirmed — status updated.');
      startTransition(() => router.refresh());
      return;
    }
    if (result.error) {
      setIsError(true);
      setMessage(result.error);
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button
        type="button"
        onClick={handleRecheck}
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
          opacity: isPending ? 0.6 : 1,
          whiteSpace: 'nowrap',
          transition: 'background 0.15s ease',
        }}
      >
        {isPending ? 'Checking…' : 'Re-check'}
      </button>
      {message && (
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: isError ? 'var(--color-danger)' : 'var(--color-success)',
          }}
        >
          {message}
        </span>
      )}
    </div>
  );
}
