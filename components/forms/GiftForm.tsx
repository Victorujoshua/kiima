'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import GiftTagPill from '@/components/shared/GiftTagPill';
import CurrencyInput from '@/components/shared/CurrencyInput';
import AnonymousToggle from '@/components/shared/AnonymousToggle';
import KiimaButton from '@/components/shared/KiimaButton';
import { initializeGift } from '@/lib/actions/gift.actions';
import type { GiftTag, Currency } from '@/types';

interface GiftFormProps {
  recipientId: string;
  tags: GiftTag[];
  currency: Currency;
}

export default function GiftForm({ recipientId, tags, currency }: GiftFormProps) {
  const [state, formAction] = useFormState(initializeGift, null);
  const [selectedTag, setSelectedTag] = useState<GiftTag | null>(null);
  const [amount, setAmount] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isAnon, setIsAnon] = useState(false);

  function handleTagSelect(tag: GiftTag | null) {
    setSelectedTag(tag);
    setAmount(tag ? String(tag.amount) : '');
  }

  const canSubmit = Number(amount) > 0;

  return (
    <div style={cardStyle}>
      <h2 style={headingStyle}>Send a gift</h2>

      <form
        action={formAction}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
      >
        {/* Hidden fields */}
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
          <label style={labelStyle}>
            {selectedTag ? 'Amount' : 'How much?'}
          </label>
          <CurrencyInput
            currency={currency}
            value={amount}
            onChange={setAmount}
            readOnly={selectedTag !== null}
          />
          {selectedTag && (
            <p style={hintStyle}>
              Tap the tag again to enter a custom amount.
            </p>
          )}
        </div>

        {/* Name */}
        <div>
          <label htmlFor="gift-name" style={labelStyle}>
            Your name
          </label>
          <input
            id="gift-name"
            name="display_name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name (optional)"
            autoComplete="off"
            className="k-input"
          />
        </div>

        {/* Anonymous toggle — Section 4.3 */}
        <AnonymousToggle
          isAnon={isAnon}
          displayName={displayName}
          onChange={setIsAnon}
        />

        {/* Global error */}
        {state?.error && (
          <p style={errorStyle} role="alert">
            {state.error}
          </p>
        )}

        {/* CTA */}
        <SubmitButton disabled={!canSubmit} />

        {!canSubmit && (
          <p style={{ ...hintStyle, textAlign: 'center' }}>
            Choose a tag or enter an amount to continue.
          </p>
        )}
      </form>
    </div>
  );
}

// ─── Submit button (needs useFormStatus — must be inside <form>) ──────────────

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

const hintStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  color: 'var(--color-text-muted)',
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

