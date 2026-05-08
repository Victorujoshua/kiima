'use client';

import { formatCurrency } from '@/lib/utils/currency';
import type { Currency } from '@/types';

interface Props {
  label: string;
  amount: number;
  currency: Currency;
  targetId?: string;
}

export default function StickyGiftButton({
  label,
  amount,
  currency,
  targetId = 'gift-card',
}: Props) {
  function handleClick() {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Send a gift: ${label}`}
      className="k-sticky-gift-btn"
      style={buttonStyle}
    >
      <span style={labelStyle}>{label}</span>
      <span style={amountStyle}>{formatCurrency(amount, currency)}</span>
    </button>
  );
}

const buttonStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 24,
  right: 24,
  zIndex: 40,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
  background: '#FF5C00',
  backgroundColor: '#FF5C00',
  color: '#ffffff',
  border: 'none',
  borderRadius: '100px',
  padding: '12px 22px',
  cursor: 'pointer',
  boxShadow: '0 8px 24px rgba(255, 92, 0, 0.35)',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  fontFamily: 'var(--font-body)',
  colorScheme: 'light',
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 14,
  color: '#ffffff',
  lineHeight: 1.2,
  whiteSpace: 'nowrap',
};

const amountStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 500,
  fontSize: 12,
  color: 'rgba(255,255,255,0.85)',
  lineHeight: 1.2,
  whiteSpace: 'nowrap',
};
