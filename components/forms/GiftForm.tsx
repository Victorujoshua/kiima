'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import GiftTagPill from '@/components/shared/GiftTagPill';
import CurrencyInput from '@/components/shared/CurrencyInput';
import AnonymousToggle from '@/components/shared/AnonymousToggle';
import KiimaButton from '@/components/shared/KiimaButton';
import { initializeGift } from '@/lib/actions/gift.actions';
import { calculateAllFees } from '@/lib/utils/fee';
import { formatCurrency } from '@/lib/utils/currency';
import type { GiftTag, Currency } from '@/types';

interface GiftFormProps {
  recipientId: string;
  tags: GiftTag[];
  currency: Currency;
  feePercent: number;
}

export default function GiftForm({ recipientId, tags, currency, feePercent }: GiftFormProps) {
  const [state, formAction] = useFormState(initializeGift, null);
  const [selectedTag, setSelectedTag] = useState<GiftTag | null>(null);
  const [amount, setAmount] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isAnon, setIsAnon] = useState(false);
  const [nameError, setNameError] = useState('');

  function handleTagSelect(tag: GiftTag | null) {
    setSelectedTag(tag);
    setAmount(tag ? String(tag.amount) : '');
  }

  function handleAmountChange(value: string) {
    setAmount(value);
    if (selectedTag && value !== String(selectedTag.amount)) {
      setSelectedTag(null);
    }
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDisplayName(e.target.value);
    if (e.target.value.trim()) setNameError('');
  }

  function handleNameBlur() {
    if (!isAnon && !displayName.trim()) {
      setNameError('Please enter your name');
    }
  }

  function handleAnonChange(value: boolean) {
    setIsAnon(value);
    if (value) {
      setDisplayName('');
      setNameError('');
    }
  }

  const numericAmount = Number(amount);
  const amountMissing = numericAmount <= 0;
  const canSubmit = !amountMissing && (isAnon || displayName.trim() !== '');

  // Live fee breakdown — only shown when there's a valid amount
  const fees = numericAmount > 0 ? calculateAllFees(numericAmount, feePercent) : null;

  return (
    <div style={cardStyle}>
      <h2 style={headingStyle}>Send a gift</h2>

      <form
        action={formAction}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
      >
        <input type="hidden" name="recipient_id" value={recipientId} />
        <input type="hidden" name="tag_id" value={selectedTag?.id ?? ''} />
        <input type="hidden" name="is_anonymous" value={String(isAnon)} />
        <input type="hidden" name="amount" value={amount} />

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

        {/* Amount */}
        <div>
          <label style={labelStyle}>How much?</label>
          <CurrencyInput
            currency={currency}
            value={amount}
            onChange={handleAmountChange}
          />
        </div>

        {/* Live fee breakdown */}
        {fees && (
          <div style={feeBreakdownStyle}>
            <span>{`You're sending ${formatCurrency(fees.gift_amount, currency)}`}</span>
            <span style={feeSepStyle}>·</span>
            <span>{`Processing fee ${formatCurrency(fees.paystack_fee, currency)}`}</span>
            <span style={feeSepStyle}>·</span>
            <span style={feeTotalStyle}>{`Total charged ${formatCurrency(fees.total_charged, currency)}`}</span>
          </div>
        )}

        {/* Name */}
        <div>
          <label htmlFor="gift-name" style={labelStyle}>Your name</label>
          <input
            id="gift-name"
            name="display_name"
            type="text"
            value={isAnon ? '' : displayName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            placeholder={isAnon ? 'Sending anonymously' : 'Your name'}
            disabled={isAnon}
            autoComplete="off"
            className={`k-input${nameError ? ' k-input--error' : ''}`}
          />
          {nameError && (
            <p style={fieldErrorStyle} role="alert">{nameError}</p>
          )}
        </div>

        {/* Anonymous toggle */}
        <AnonymousToggle
          isAnon={isAnon}
          displayName={displayName}
          onChange={handleAnonChange}
        />

        {state?.error && (
          <p style={errorStyle} role="alert">{state.error}</p>
        )}

        <SubmitButton disabled={!canSubmit} />

        {amountMissing && (
          <p style={{ ...hintStyle, textAlign: 'center' }}>
            Please enter an amount to continue.
          </p>
        )}
      </form>
    </div>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <KiimaButton type="submit" disabled={disabled || pending} loading={pending} fullWidth>
      Send gift ❤️
    </KiimaButton>
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
  margin: '0 0 var(--space-sm)',
};

const pillsWrapStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--space-sm)',
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

const feeBreakdownStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '4px',
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  color: 'var(--color-text-muted)',
  background: 'var(--color-bg)',
  borderRadius: 'var(--radius-sm)',
  padding: '10px var(--space-md)',
};

const feeSepStyle: React.CSSProperties = {
  color: 'var(--color-border-hover)',
};

const feeTotalStyle: React.CSSProperties = {
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
};

const hintStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  color: 'var(--color-text-muted)',
  margin: 'var(--space-xs) 0 0',
};

const fieldErrorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  color: 'var(--color-danger)',
  margin: 'var(--space-xs) 0 0',
};

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--color-danger)',
  background: 'var(--color-danger-soft)',
  borderRadius: 'var(--radius-sm)',
  padding: '10px var(--space-md)',
  margin: 0,
};
