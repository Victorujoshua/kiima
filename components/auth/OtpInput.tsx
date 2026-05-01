'use client';

import { useRef } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

export default function OtpInput({ value, onChange, disabled }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function set(i: number, digit: string): string {
    const arr = Array.from({ length: 6 }, (_, j) => value[j] ?? '');
    arr[i] = digit;
    return arr.join('').replace(/\s+$/, '').trimEnd();
  }

  function handleChange(i: number, raw: string) {
    const digit = raw.replace(/\D/g, '').slice(-1);
    if (!digit) return;
    onChange(set(i, digit));
    if (i < 5) refs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace') {
      if (value[i]) {
        onChange(set(i, ''));
      } else if (i > 0) {
        onChange(set(i - 1, ''));
        refs.current[i - 1]?.focus();
      }
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    const focus = Math.min(pasted.length, 5);
    refs.current[focus]?.focus();
  }

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {Array.from({ length: 6 }).map((_, i) => {
        const filled   = Boolean(value[i]);
        const isActive = !disabled && value.length === i;
        return (
          <input
            key={i}
            ref={el => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[i] ?? ''}
            disabled={disabled}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            style={{
              width: 48,
              height: 56,
              border: `2px solid ${isActive ? '#D7D744' : filled ? '#1C1916' : '#e0e0e0'}`,
              borderRadius: 12,
              background: disabled ? '#f8f8f8' : '#fff',
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              fontSize: 20,
              color: '#1C1916',
              textAlign: 'center',
              outline: 'none',
              transition: 'border-color 0.15s ease',
              cursor: disabled ? 'not-allowed' : 'text',
            }}
          />
        );
      })}
    </div>
  );
}
