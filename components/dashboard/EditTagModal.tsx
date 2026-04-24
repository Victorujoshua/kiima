'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { updateTag } from '@/lib/actions/tag.actions';
import type { GiftTag, Currency } from '@/types';

interface Props {
  tag: GiftTag;
  userId: string;
  currency: Currency;
  onClose: () => void;
  onSuccess: (tag: GiftTag) => void;
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} style={submitStyle(pending)}>
      {pending ? 'Saving…' : 'Save changes'}
    </button>
  );
}

export default function EditTagModal({ tag, userId, currency, onClose, onSuccess }: Props) {
  const [state, formAction] = useFormState(updateTag, null);

  useEffect(() => {
    if (state?.success && state.tag) {
      onSuccess(state.tag);
    }
  }, [state, onSuccess]);

  const fe = state?.fieldErrors ?? {};

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={backdropStyle} />

      {/* Sheet */}
      <div style={sheetStyle}>
        <div style={handleStyle} />
        <h2 style={titleStyle}>Edit tag</h2>

        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input type="hidden" name="tag_id" value={tag.id} />
          <input type="hidden" name="user_id" value={userId} />

          <div>
            <label style={labelStyle}>Tag label</label>
            <input
              name="label"
              type="text"
              defaultValue={tag.label}
              autoFocus
              autoComplete="off"
              style={inputStyle(!!fe.label)}
            />
            {fe.label && <p style={fieldErrStyle}>{fe.label}</p>}
          </div>

          <div>
            <label style={labelStyle}>Amount ({currency})</label>
            <input
              name="amount"
              type="number"
              min="1"
              step="1"
              defaultValue={tag.amount}
              style={inputStyle(!!fe.amount)}
            />
            {fe.amount && <p style={fieldErrStyle}>{fe.amount}</p>}
          </div>

          {state?.error && (
            <p style={errBoxStyle} role="alert">{state.error}</p>
          )}

          <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
            <SaveButton />
            <button type="button" onClick={onClose} style={cancelStyle}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const backdropStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(28,25,22,0.45)',
  zIndex: 100,
};

const sheetStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 101,
  background: 'var(--color-surface)',
  borderRadius: '22px 22px 0 0',
  padding: '12px 20px 40px',
  boxShadow: '0 -4px 30px rgba(28,25,22,0.12)',
  animation: 'slide-up 0.25s ease',
};

const handleStyle: React.CSSProperties = {
  width: '36px',
  height: '4px',
  borderRadius: '2px',
  background: 'var(--color-border)',
  margin: '0 auto 20px',
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 500,
  fontSize: '20px',
  color: 'var(--color-text-primary)',
  margin: '0 0 20px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--color-text-faint)',
  marginBottom: '6px',
};

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    width: '100%',
    height: '48px',
    border: `1.5px solid ${hasError ? 'var(--color-danger)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-surface)',
    fontFamily: 'var(--font-body)',
    fontSize: '15px',
    color: 'var(--color-text-primary)',
    padding: '0 14px',
    outline: 'none',
    boxSizing: 'border-box',
  };
}

function submitStyle(pending: boolean): React.CSSProperties {
  return {
    flex: 1,
    height: '48px',
    background: pending ? 'var(--color-text-muted)' : 'var(--color-accent)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-full)',
    fontFamily: 'var(--font-body)',
    fontWeight: 700,
    fontSize: '15px',
    cursor: pending ? 'not-allowed' : 'pointer',
    transition: 'background 0.15s ease',
  };
}

const cancelStyle: React.CSSProperties = {
  flex: 1,
  height: '48px',
  background: 'transparent',
  color: 'var(--color-text-secondary)',
  border: '1.5px solid var(--color-border)',
  borderRadius: 'var(--radius-full)',
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '15px',
  cursor: 'pointer',
};

const fieldErrStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  color: 'var(--color-danger)',
  margin: '4px 0 0',
};

const errBoxStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--color-danger)',
  background: 'var(--color-danger-soft)',
  borderRadius: 'var(--radius-sm)',
  padding: '10px 14px',
  margin: 0,
};
