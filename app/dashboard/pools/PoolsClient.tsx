'use client';

import { useState } from 'react';
import PoolCreateForm from '@/components/forms/PoolCreateForm';
import type { Currency } from '@/types';

interface PoolsClientProps {
  userId: string;
  currency: Currency;
}

export default function PoolsClient({ userId, currency }: PoolsClientProps) {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return (
      <div style={{ width: '100%' }}>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          style={cancelBtnStyle}
        >
          ← Cancel
        </button>
        <div style={{ marginTop: 'var(--space-md)' }}>
          <PoolCreateForm userId={userId} currency={currency} />
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setShowForm(true)}
      className="k-btn k-btn--primary"
      style={{ flexShrink: 0 }}
    >
      + Create pool
    </button>
  );
}

const cancelBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '14px',
  color: 'var(--color-accent)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
};
