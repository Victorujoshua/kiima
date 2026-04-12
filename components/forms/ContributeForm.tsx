'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import CurrencyInput from '@/components/shared/CurrencyInput';
import AnonymousToggle from '@/components/shared/AnonymousToggle';
import KiimaButton from '@/components/shared/KiimaButton';
import { initializeGift } from '@/lib/actions/gift.actions';
import type { Currency } from '@/types';

// Fixed contribution tiers per currency
const TIERS: Record<Currency, number[]> = {
  NGN: [5000, 10000, 20000, 50000, 100000],
  USD: [5, 10, 20, 50, 100],
  GBP: [5, 10, 20, 50, 100],
  EUR: [5, 10, 20, 50, 100],
};

const CURRENCY_SYMBOL: Record<Currency, string> = {
  NGN: '₦',
  USD: '$',
  GBP: '£',
  EUR: '€',
};

function formatTier(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOL[currency];
  return `${symbol}${amount.toLocaleString('en')}`;
}

interface ContributeFormProps {
  poolId: string;
  recipientId: string;
  currency: Currency;
  isClosed: boolean;
}

export default function ContributeForm({
  poolId,
  recipientId,
  currency,
  isClosed,
}: ContributeFormProps) {
  if (isClosed) {
    return (
      <div style={cardStyle}>
        <p style={closedEmojiStyle}>🔒</p>
        <h2 style={closedHeadingStyle}>This pool is closed</h2>
        <p style={closedBodyStyle}>
          The creator has closed this support pool. No new contributions can be made.
        </p>
      </div>
    );
  }

  return <OpenForm poolId={poolId} recipientId={recipientId} currency={currency} />;
}

// Separated so hooks are only called when the pool is open
function OpenForm({
  poolId,
  recipientId,
  currency,
}: {
  poolId: string;
  recipientId: string;
  currency: Currency;
}) {
  const [state, formAction] = useFormState(initializeGift, null);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isAnon, setIsAnon] = useState(false);
  const [nameError, setNameError] = useState('');

  const tiers = TIERS[currency];

  function handleTierSelect(tier: number) {
    setSelectedTier(tier);
    setAmount(String(tier));
  }

  function handleAmountChange(value: string) {
    setAmount(value);
    // Deselect the active tier when the gifter edits the amount away from it
    if (selectedTier !== null && value !== String(selectedTier)) {
      setSelectedTier(null);
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

  const amountMissing = Number(amount) <= 0;
  const canSubmit = !amountMissing && (isAnon || displayName.trim() !== '');

  return (
    <div style={cardStyle}>
      <h2 style={headingStyle}>Support this pool</h2>

      <form
        action={formAction}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
      >
        {/* Hidden fields */}
        <input type="hidden" name="pool_id" value={poolId} />
        <input type="hidden" name="recipient_id" value={recipientId} />
        <input type="hidden" name="is_anonymous" value={String(isAnon)} />
        <input type="hidden" name="amount" value={amount} />

        {/* Tier pills */}
        <div>
          <label style={labelStyle}>Quick amounts</label>
          <div style={tiersWrapStyle}>
            {tiers.map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => handleTierSelect(tier)}
                style={{
                  ...tierPillStyle,
                  ...(selectedTier === tier ? tierPillSelectedStyle : {}),
                }}
                aria-pressed={selectedTier === tier}
              >
                {formatTier(tier, currency)}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label style={labelStyle}>Or enter a custom amount</label>
          <CurrencyInput
            currency={currency}
            value={amount}
            onChange={handleAmountChange}
          />
        </div>

        {/* Name */}
        <div>
          <label htmlFor="contribute-name" style={labelStyle}>Your name</label>
          <input
            id="contribute-name"
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

        {/* Global error */}
        {state?.error && (
          <p style={errorStyle} role="alert">{state.error}</p>
        )}

        <SubmitButton disabled={!canSubmit} />

        {amountMissing && (
          <p style={{ ...hintStyle, textAlign: 'center' }}>
            Choose an amount or enter a custom one to continue.
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
      Support this 🤍
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

const tiersWrapStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--space-sm)',
  marginTop: 'var(--space-xs)',
};

const tierPillStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '13px',
  borderRadius: 'var(--radius-full)',
  padding: '6px 16px',
  border: '1.5px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-secondary)',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

const tierPillSelectedStyle: React.CSSProperties = {
  background: 'var(--color-accent)',
  borderColor: 'var(--color-accent)',
  color: '#fff',
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

const closedEmojiStyle: React.CSSProperties = {
  fontSize: '36px',
  margin: '0 0 var(--space-sm)',
  textAlign: 'center',
};

const closedHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '16px',
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-xs)',
  textAlign: 'center',
};

const closedBodyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-secondary)',
  lineHeight: 1.6,
  margin: 0,
  textAlign: 'center',
};
