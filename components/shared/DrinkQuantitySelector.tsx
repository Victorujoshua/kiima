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
    if (!isNaN(num) && num >= 1) onSelect(num);
  }

  return (
    <div style={trayStyle}>
      <span style={emojiStyle}>🥤</span>
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
        placeholder="?"
        style={isInputSelected ? selectedInputStyle : inputStyle}
        aria-label="Custom quantity"
      />
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const trayStyle: React.CSSProperties = {
  background: '#F6F3EE',
  border: '1.5px solid rgba(0,0,0,0.08)',
  padding: '12px 16px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
};

const emojiStyle: React.CSSProperties = {
  fontSize: '18px',
  lineHeight: 1,
};

const timesStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontWeight: 700,
  fontSize: '15px',
  color: '#9A9089',
  lineHeight: 1,
};

const basePillStyle: React.CSSProperties = {
  minWidth: '44px',
  height: '40px',
  border: '1.5px solid rgba(0,0,0,0.15)',
  fontFamily: 'var(--kiima-font)',
  fontWeight: 700,
  fontSize: '14px',
  cursor: 'pointer',
  padding: '0 12px',
  transition: 'background 0.12s ease, border-color 0.12s ease',
  background: '#ffffff',
};

const pillStyle: React.CSSProperties = {
  ...basePillStyle,
  color: '#1C1916',
};

const selectedPillStyle: React.CSSProperties = {
  ...basePillStyle,
  background: '#D7D744',
  borderColor: '#D7D744',
  color: '#000000',
};

const baseInputStyle: React.CSSProperties = {
  width: '48px',
  height: '40px',
  border: '1.5px solid rgba(0,0,0,0.15)',
  fontFamily: 'var(--kiima-font)',
  fontWeight: 700,
  fontSize: '14px',
  textAlign: 'center',
  padding: '0 4px',
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'background 0.12s ease, border-color 0.12s ease',
  cursor: 'text',
  background: '#ffffff',
  color: '#1C1916',
};

const inputStyle: React.CSSProperties = {
  ...baseInputStyle,
};

const selectedInputStyle: React.CSSProperties = {
  ...baseInputStyle,
  background: '#D7D744',
  borderColor: '#D7D744',
  color: '#000000',
};
