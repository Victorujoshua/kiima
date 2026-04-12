'use client';

import { useState } from 'react';
import GiftTagPill from '@/components/shared/GiftTagPill';
import CurrencyInput from '@/components/shared/CurrencyInput';
import type { GiftTag, Currency } from '@/types';

interface GiftActionCardProps {
  tags: GiftTag[];
  currency: Currency;
  // Optional controlled props — used when connected to payment form (Phase 4)
  selectedTag?: GiftTag | null;
  onTagSelect?: (tag: GiftTag | null) => void;
  onAmountChange?: (amount: string) => void;
}

export default function GiftActionCard({
  tags,
  currency,
  selectedTag: controlledTag,
  onTagSelect,
  onAmountChange,
}: GiftActionCardProps) {
  // Internal state — active when uncontrolled (no payment form yet)
  const [internalTag, setInternalTag] = useState<GiftTag | null>(null);
  const [amount, setAmount] = useState('');

  const isControlled = controlledTag !== undefined;
  const selectedTag = isControlled ? controlledTag : internalTag;

  function handleTagSelect(tag: GiftTag | null) {
    if (!isControlled) {
      setInternalTag(tag);
      setAmount(tag ? String(tag.amount) : '');
    }
    onTagSelect?.(tag);
  }

  function handleAmountChange(value: string) {
    setAmount(value);
    onAmountChange?.(value);
  }

  return (
    <div style={cardStyle}>
      <h2 style={headingStyle}>Send a gift</h2>

      {/* Tag pills */}
      {tags.length > 0 && (
        <div style={pillsWrapStyle}>
          {tags.map((tag) => (
            <GiftTagPill
              key={tag.id}
              tag={tag}
              selected={selectedTag?.id === tag.id}
              onSelect={handleTagSelect}
              currency={currency}
            />
          ))}
        </div>
      )}

      {/* Amount input */}
      <div style={{ marginTop: 'var(--space-md)' }}>
        <label style={labelStyle}>
          {selectedTag ? 'Amount' : 'How much?'}
        </label>
        <CurrencyInput
          currency={currency}
          value={isControlled ? String(controlledTag?.amount ?? '') : amount}
          onChange={handleAmountChange}
          readOnly={selectedTag !== null}
        />
        {selectedTag && (
          <p style={hintStyle}>
            Tap the tag again to deselect and enter a custom amount.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--shadow-card)',
  padding: 'var(--space-xl)',
};

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '18px',
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-md)',
};

const pillsWrapStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--space-sm)',
  marginBottom: 'var(--space-sm)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--color-text-faint)',
  marginBottom: 'var(--space-xs)',
};

const hintStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  color: 'var(--color-text-muted)',
  margin: 'var(--space-xs) 0 0',
};
