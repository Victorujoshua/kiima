'use client';

import type { Currency } from '@/types';

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  NGN: '₦',
  USD: '$',
  GBP: '£',
  EUR: '€',
};

interface CurrencyInputProps {
  currency: Currency;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

export default function CurrencyInput({
  currency,
  value,
  onChange,
  readOnly = false,
}: CurrencyInputProps) {
  const symbol = CURRENCY_SYMBOLS[currency];

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Strip anything that isn't a digit
    onChange?.(e.target.value.replace(/[^0-9]/g, ''));
  }

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {/* Currency symbol prefix */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 'var(--space-md)',
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          fontSize: '22px',
          lineHeight: 1,
          color: readOnly ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {symbol}
      </span>

      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={readOnly ? undefined : handleChange}
        readOnly={readOnly}
        placeholder="0"
        className="k-input"
        style={{
          paddingLeft: '44px',
          fontSize: '22px',
          fontWeight: 700,
          fontFamily: 'var(--font-body)',
          color: readOnly ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
          background: readOnly ? 'var(--color-bg)' : 'var(--color-surface)',
          cursor: readOnly ? 'default' : 'text',
          borderColor: readOnly ? 'var(--color-border)' : undefined,
        }}
      />
    </div>
  );
}
