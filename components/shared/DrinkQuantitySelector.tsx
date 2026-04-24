'use client';

import { useState } from 'react';
import type { Currency } from '@/types';

export type DrinkQty = number;

const FIXED_QUANTITIES = [1, 3, 5] as const;

interface Props {
  drinkPrice: number;
  currency: Currency;
  selectedQty: DrinkQty;
  onSelect: (qty: DrinkQty) => void;
}

export default function DrinkQuantitySelector({ selectedQty, onSelect }: Props) {

  const [customInput, setCustomInput] = useState('');

  const customNum = parseInt(customInput, 10);
  const isValidCustom = !isNaN(customNum) && customNum >= 1;
  const matchesPill = isValidCustom && (customNum === 1 || customNum === 3 || customNum === 5);
  const isInputSelected = customInput !== '' && !matchesPill;

  function isPillSelected(qty: number): boolean {
    if (customInput === '') return qty === selectedQty;
    return matchesPill && customNum === qty;
  }

  function handlePillClick(qty: number) {
    setCustomInput('');
    onSelect(qty);
  }

  function handleCustomChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setCustomInput(raw);
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num >= 1) {
      onSelect(num);
    }
  }

  return (
    <div style={trayStyle}>
      <span style={{ fontSize: '22px', lineHeight: 1 }}>🥤</span>
      <span style={timesStyle}>×</span>

      {FIXED_QUANTITIES.map((qty) => (
        <button
          key={qty}
          type="button"
          onClick={() => handlePillClick(qty)}
          style={isPillSelected(qty) ? selectedPillStyle : pillStyle}
        >
          {qty}
        </button>
      ))}

      <input
        type="number"
        min={1}
        value={customInput}
        onChange={handleCustomChange}
        placeholder="10"
        style={isInputSelected ? selectedInputStyle : inputStyle}
        aria-label="Custom quantity"
      />
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const trayStyle: React.CSSProperties = {
  background: 'var(--color-accent-soft)',
  borderRadius: 'var(--radius-md)',
  padding: '12px 16px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'wrap',
};

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

const baseInputStyle: React.CSSProperties = {
  width: '52px',
  height: '44px',
  borderRadius: '15%',
  border: '1.5px solid var(--color-accent)',
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '15px',
  textAlign: 'center',
  padding: '0 4px',
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'all 0.15s ease',
  cursor: 'text',
};

const inputStyle: React.CSSProperties = {
  ...baseInputStyle,
  background: 'var(--color-surface)',
  color: 'var(--color-accent)',
};

const selectedInputStyle: React.CSSProperties = {
  ...baseInputStyle,
  background: 'var(--color-accent)',
  color: '#fff',
  boxShadow: '0 2px 8px rgba(200, 123, 92, 0.35)',
};
