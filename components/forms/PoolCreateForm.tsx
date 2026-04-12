'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createPool } from '@/lib/actions/pool.actions';
import KiimaButton from '@/components/shared/KiimaButton';
import CurrencyInput from '@/components/shared/CurrencyInput';
import { useState } from 'react';
import type { Currency } from '@/types';

interface PoolCreateFormProps {
  userId: string;
  currency: Currency;
}

export default function PoolCreateForm({ userId, currency }: PoolCreateFormProps) {
  const [state, formAction] = useFormState(createPool, null);
  const [goalAmount, setGoalAmount] = useState('');
  const [showContributors, setShowContributors] = useState(true);

  return (
    <div style={cardStyle}>
      <h2 style={headingStyle}>Create a support pool</h2>
      <p style={subStyle}>
        Set a goal and let your supporters chip in together.
      </p>

      <form
        action={formAction}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
      >
        <input type="hidden" name="user_id" value={userId} />
        <input type="hidden" name="goal_amount" value={goalAmount} />
        <input type="hidden" name="show_contributors" value={String(showContributors)} />

        {/* Title */}
        <div>
          <label htmlFor="pool-title" style={labelStyle}>Pool title</label>
          <input
            id="pool-title"
            name="title"
            type="text"
            placeholder="e.g. New camera fund 📷"
            maxLength={80}
            autoComplete="off"
            className={`k-input${state?.fieldErrors?.title ? ' k-input--error' : ''}`}
          />
          {state?.fieldErrors?.title && (
            <p style={fieldErrorStyle} role="alert">{state.fieldErrors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="pool-desc" style={labelStyle}>
            Description{' '}
            <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--color-text-muted)', fontSize: '11px' }}>
              (optional)
            </span>
          </label>
          <textarea
            id="pool-desc"
            name="description"
            placeholder="Tell your supporters what this pool is for…"
            rows={3}
            maxLength={400}
            className="k-input"
            style={{ resize: 'vertical', minHeight: '80px' }}
          />
        </div>

        {/* Goal amount */}
        <div>
          <label style={labelStyle}>Goal amount</label>
          <CurrencyInput
            currency={currency}
            value={goalAmount}
            onChange={setGoalAmount}
          />
          {state?.fieldErrors?.goal_amount && (
            <p style={fieldErrorStyle} role="alert">{state.fieldErrors.goal_amount}</p>
          )}
        </div>

        {/* Show contributors toggle */}
        <div style={toggleRowStyle}>
          <div>
            <span style={toggleLabelStyle}>Show recent contributors publicly</span>
            <p style={toggleDescStyle}>
              When on, anyone visiting your pool page can see who has contributed
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={showContributors}
            aria-label="Toggle show contributors"
            onClick={() => setShowContributors((v) => !v)}
            style={{
              width: '44px',
              height: '24px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              background: showContributors ? 'var(--color-accent)' : 'rgba(28, 25, 22, 0.14)',
              transition: 'background 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: showContributors ? 'flex-end' : 'flex-start',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#ffffff',
                boxShadow: '0 1px 4px rgba(28, 25, 22, 0.20)',
                display: 'block',
                flexShrink: 0,
              }}
            />
          </button>
        </div>

        {/* Global error */}
        {state?.error && (
          <p style={errorStyle} role="alert">{state.error}</p>
        )}

        <SubmitButton />
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <KiimaButton type="submit" loading={pending} fullWidth>
      Create pool
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
  margin: '0 0 var(--space-xs)',
};

const subStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-secondary)',
  margin: '0 0 var(--space-md)',
  lineHeight: 1.5,
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

const toggleRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 'var(--space-md)',
  padding: 'var(--space-md)',
  background: 'var(--color-bg)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
};

const toggleLabelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '13px',
  color: 'var(--color-text-primary)',
  marginBottom: '2px',
};

const toggleDescStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  color: 'var(--color-text-muted)',
  margin: 0,
  lineHeight: 1.5,
};
