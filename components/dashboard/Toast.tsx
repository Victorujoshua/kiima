'use client';

import { useEffect } from 'react';

interface Props {
  message: string;
  variant?: 'success' | 'error';
  onDismiss: () => void;
}

export default function Toast({ message, variant = 'success', onDismiss }: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '88px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        background: variant === 'error' ? 'var(--color-danger)' : '#1C1916',
        color: '#fff',
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        fontSize: '14px',
        padding: '12px 20px',
        borderRadius: 'var(--radius-full)',
        boxShadow: '0 4px 20px rgba(28,25,22,0.25)',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        animation: 'toast-in 0.2s ease',
      }}
    >
      {message}
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
