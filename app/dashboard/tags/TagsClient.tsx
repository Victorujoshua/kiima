'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import KiimaButton from '@/components/shared/KiimaButton';
import { createTag, deleteTag } from '@/lib/actions/tag.actions';
import { formatCurrency } from '@/lib/utils/currency';
import type { GiftTag, Currency } from '@/types';

// ─── TagAddForm ───────────────────────────────────────────────────────────────
// Isolated so it gets a fresh useFormState every time it mounts (i.e. every
// time the "+ Add a new tag" button is clicked after a previous cancel/submit).

function TagAddForm({
  userId,
  currency,
  onSuccess,
  onCancel,
}: {
  userId: string;
  currency: Currency;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [state, formAction] = useFormState(createTag, null);

  useEffect(() => {
    if (state?.success) onSuccess();
  }, [state, onSuccess]);

  const fe = state?.fieldErrors ?? {};

  return (
    <form
      action={formAction}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
    >
      <input type="hidden" name="user_id" value={userId} />

      {/* Label */}
      <div>
        <label htmlFor="tag-label" style={labelStyle}>
          Tag label
        </label>
        <input
          id="tag-label"
          name="label"
          type="text"
          placeholder="e.g. Buy me lunch 🍜"
          autoFocus
          autoComplete="off"
          className={`k-input${fe.label ? ' k-input--error' : ''}`}
        />
        {fe.label && <p style={fieldErrorStyle}>{fe.label}</p>}
      </div>

      {/* Amount */}
      <div>
        <label htmlFor="tag-amount" style={labelStyle}>
          Amount ({currency})
        </label>
        <input
          id="tag-amount"
          name="amount"
          type="number"
          min="1"
          step="1"
          placeholder={currency === 'NGN' ? '2000' : '5'}
          className={`k-input${fe.amount ? ' k-input--error' : ''}`}
        />
        {fe.amount && <p style={fieldErrorStyle}>{fe.amount}</p>}
      </div>

      {/* Global error */}
      {state?.error && (
        <p style={errorBoxStyle} role="alert">
          {state.error}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
        <KiimaButton type="submit">Save tag</KiimaButton>
        <KiimaButton type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </KiimaButton>
      </div>
    </form>
  );
}

// ─── TagsClient ───────────────────────────────────────────────────────────────

interface TagsClientProps {
  tags: GiftTag[];
  userId: string;
  currency: Currency;
}

export default function TagsClient({ tags, userId, currency }: TagsClientProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleCreateSuccess = useCallback(() => {
    setShowForm(false);
    startTransition(() => router.refresh());
  }, [router]);

  async function handleDelete(tagId: string) {
    setDeletingId(tagId);
    setDeleteError(null);
    const result = await deleteTag(tagId, userId);
    setDeletingId(null);
    if (result.error) {
      setDeleteError(result.error);
    } else {
      startTransition(() => router.refresh());
    }
  }

  return (
    <main style={pageStyle}>
      {/* Page header */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={headingStyle}>Your gift tags</h1>
        <p style={subtitleStyle}>
          Supporters see these as quick-pick buttons on your gift page.
        </p>
      </div>

      {/* Tags card */}
      <div style={cardStyle}>
        {/* Tag list */}
        {tags.length === 0 ? (
          <p style={emptyStyle}>No tags yet — add one below.</p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {tags.map((tag, index) => (
              <li key={tag.id} style={{
                ...tagRowStyle,
                borderBottom: index < tags.length - 1
                  ? '1px solid var(--color-border)'
                  : 'none',
              }}>
                {/* Left: badge + label + amount */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', minWidth: 0 }}>
                  {tag.is_default && (
                    <span style={systemBadgeStyle}>SYSTEM</span>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <p style={tagLabelStyle}>{tag.label}</p>
                    <p style={tagAmountStyle}>{formatCurrency(tag.amount, currency)}</p>
                  </div>
                </div>

                {/* Right: remove button (custom tags only — Section 4.2) */}
                {!tag.is_default && (
                  <button
                    type="button"
                    onClick={() => handleDelete(tag.id)}
                    disabled={deletingId === tag.id}
                    style={{
                      ...removeButtonStyle,
                      opacity: deletingId === tag.id ? 0.5 : 1,
                      cursor: deletingId === tag.id ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {deletingId === tag.id ? 'Removing…' : 'Remove'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Delete error */}
        {deleteError && (
          <p style={{ ...errorBoxStyle, marginTop: 'var(--space-md)' }} role="alert">
            {deleteError}
          </p>
        )}

        {/* Divider */}
        <div style={{
          borderTop: '1px solid var(--color-border)',
          marginTop: tags.length > 0 ? 'var(--space-md)' : 0,
          paddingTop: 'var(--space-md)',
        }} />

        {/* Inline add form OR add button */}
        {showForm ? (
          <TagAddForm
            userId={userId}
            currency={currency}
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            style={addButtonStyle}
          >
            + Add a new tag
          </button>
        )}
      </div>
    </main>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  maxWidth: '900px',
  margin: '0 auto',
  padding: '40px 0',
};

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 500,
  fontSize: '28px',
  color: 'var(--color-text-primary)',
  marginBottom: 'var(--space-xs)',
};

const subtitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  lineHeight: 1.65,
  color: 'var(--color-text-secondary)',
};

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--shadow-card)',
  padding: 'var(--space-xl)',
};

const tagRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--space-md)',
  padding: 'var(--space-md) 0',
};

const systemBadgeStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '10px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--color-accent)',
  background: 'var(--color-accent-soft)',
  borderRadius: 'var(--radius-full)',
  padding: '2px 8px',
  whiteSpace: 'nowrap',
  flexShrink: 0,
};

const tagLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '15px',
  color: 'var(--color-text-primary)',
  margin: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const tagAmountStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '13px',
  color: 'var(--color-text-muted)',
  margin: '2px 0 0',
};

const removeButtonStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '13px',
  color: 'var(--color-danger)',
  background: 'none',
  border: 'none',
  padding: '10px var(--space-sm)',
  minHeight: '44px',
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 'var(--radius-sm)',
  transition: 'background 0.15s ease',
  flexShrink: 0,
};

const addButtonStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '14px',
  color: 'var(--color-accent)',
  background: 'none',
  border: 'none',
  padding: '10px 0',
  minHeight: '44px',
  display: 'inline-flex',
  alignItems: 'center',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'opacity 0.15s ease',
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
  marginTop: 'var(--space-xs)',
};

const errorBoxStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--color-danger)',
  background: 'var(--color-danger-soft)',
  borderRadius: 'var(--radius-sm)',
  padding: '10px var(--space-md)',
  margin: 0,
};

const emptyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-muted)',
  textAlign: 'center',
  padding: 'var(--space-lg) 0',
  margin: 0,
};
