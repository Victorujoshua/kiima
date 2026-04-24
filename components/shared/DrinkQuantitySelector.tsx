'use client';

import { formatCurrency } from '@/lib/utils/currency';
import type { Currency } from '@/types';

export type DrinkQty = 1 | 3 | 5 | 10;
const QUANTITIES: DrinkQty[] = [1, 3, 5, 10];

interface Props {
  drinkPrice: number;
  currency: Currency;
  selectedQty: DrinkQty;
  onSelect: (qty: DrinkQty) => void;
}

export default function DrinkQuantitySelector({ drinkPrice, currency, selectedQty, onSelect }: Props) {
  const total = drinkPrice * selectedQty;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '22px', lineHeight: 1 }}>🥤</span>
        <span style={timesStyle}>×</span>
        {QUANTITIES.map((qty) => {
          const selected = qty === selectedQty;
          return (
            <button
              key={qty}
              type="button"
              onClick={() => onSelect(qty)}
              style={selected ? selectedPillStyle : pillStyle}
            >
              {qty}
            </button>
          );
        })}
      </div>

      <p style={totalStyle}>= {formatCurrency(total, currency)}</p>
    </div>
  );
}

const timesStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 500,
  fontSize: '18px',
  color: 'var(--color-text-secondary)',
  lineHeight: 1,
};

const basePillStyle: React.CSSProperties = {
  minWidth: '48px',
  height: '44px',
  borderRadius: 'var(--radius-full)',
  border: '1.5px solid var(--color-accent)',
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '15px',
  cursor: 'pointer',
  padding: '0 14px',
  transition: 'all 0.15s ease',
};

const pillStyle: React.CSSProperties = {
  ...basePillStyle,
  background: 'var(--color-surface)',
  color: 'var(--color-accent)',
};

const selectedPillStyle: React.CSSProperties = {
  ...basePillStyle,
  background: 'var(--color-accent)',
  color: '#fff',
  boxShadow: '0 2px 8px rgba(200, 123, 92, 0.35)',
};

const totalStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 500,
  fontSize: '24px',
  color: 'var(--color-text-primary)',
  margin: 0,
};
