'use client';

import { useState, useTransition } from 'react';
import { Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { GiftTag, Currency } from '@/types';
import { createTag, deleteTag } from '@/lib/actions/tag.actions';

interface Props {
  tags: GiftTag[];
  userId: string;
  currency: Currency;
}

export default function GiftTagsRow({ tags, userId, currency }: Props) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState('');
  const [isPending, startTransition] = useTransition();

  const defaultTags = tags.filter(t => t.is_default);
  const customTags  = tags.filter(t => !t.is_default);

  function openModal() {
    setLabel('');
    setAmount('');
    setFormError('');
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
  }

  function handleCreate() {
    if (!label.trim()) { setFormError('Please enter a tag name.'); return; }
    const amt = Number(amount);
    if (!amt || amt <= 0) { setFormError('Please enter a valid amount.'); return; }
    setFormError('');

    const formData = new FormData();
    formData.set('user_id', userId);
    formData.set('label', label.trim());
    formData.set('amount', String(amt));

    startTransition(async () => {
      const result = await createTag(null, formData);
      if (result.success) {
        closeModal();
        router.refresh();
      } else {
        const err =
          result.error ??
          result.fieldErrors?.label ??
          result.fieldErrors?.amount ??
          'Something went wrong — try again.';
        setFormError(err);
      }
    });
  }

  function handleDelete(tagId: string) {
    startTransition(async () => {
      await deleteTag(tagId, userId);
      router.refresh();
    });
  }

  const currencySymbol =
    currency === 'NGN' ? '₦'
    : currency === 'USD' ? '$'
    : currency === 'GBP' ? '£'
    : '€';

  return (
    <>
      {/* ── Scrollable tag row ── */}
      <div style={rowWrapStyle}>
        <div style={rowStyle}>
          {/* Default tags — no delete */}
          {defaultTags.map(tag => (
            <div key={tag.id} style={defaultPillStyle}>
              {tag.label}
            </div>
          ))}

          {/* Custom tags — show X to delete */}
          {customTags.map(tag => (
            <div key={tag.id} className="k-inner-surface" style={customPillStyle}>
              <span style={{ lineHeight: 1 }}>{tag.label}</span>
              <button
                onClick={() => handleDelete(tag.id)}
                style={deleteBtnStyle}
                aria-label={`Delete ${tag.label}`}
                disabled={isPending}
              >
                <X size={11} strokeWidth={2.5} />
              </button>
            </div>
          ))}

          {/* Add tag button */}
          <button onClick={openModal} style={addPillStyle}>
            <Plus size={13} strokeWidth={2} />
            Add gift tag
          </button>
        </div>
      </div>

      {/* ── Add tag bottom sheet ── */}
      {showModal && (
        <div
          style={overlayStyle}
          onClick={e => e.target === e.currentTarget && closeModal()}
        >
          <div style={sheetStyle}>
            <div style={sheetHandleStyle} />

            <h3 style={sheetTitleStyle}>New gift tag</h3>

            <div style={fieldStyle}>
              <label style={fieldLabelStyle}>Tag name</label>
              <input
                className="k-input"
                placeholder="e.g. Fuel my work ⛽"
                value={label}
                onChange={e => setLabel(e.target.value)}
                maxLength={60}
                autoFocus
              />
            </div>

            <div style={fieldStyle}>
              <label style={fieldLabelStyle}>Amount ({currencySymbol})</label>
              <input
                className="k-input"
                type="number"
                placeholder={currency === 'NGN' ? '2000' : '20'}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min={1}
              />
            </div>

            {formError && <p style={errorStyle}>{formError}</p>}

            <div style={actionsStyle}>
              <button
                onClick={closeModal}
                style={cancelBtnStyle}
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                style={addBtnStyle}
                disabled={isPending}
              >
                {isPending ? 'Adding…' : 'Add tag'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const rowWrapStyle: React.CSSProperties = {
  overflowX: 'auto',
  marginBottom: 'var(--space-md)',
  marginLeft: '-20px',
  marginRight: '-20px',
  paddingLeft: '20px',
  paddingRight: '20px',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
} as React.CSSProperties;

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  paddingBottom: '4px',
};

const basePillStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  borderRadius: 'var(--radius-full)',
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '13px',
  padding: '8px 14px',
  whiteSpace: 'nowrap',
  flexShrink: 0,
};

const defaultPillStyle: React.CSSProperties = {
  ...basePillStyle,
  background: 'var(--color-accent)',
  color: '#ffffff',
  border: 'none',
};

const customPillStyle: React.CSSProperties = {
  ...basePillStyle,
  background: 'var(--color-surface)',
  color: 'var(--color-accent)',
  border: '1.5px solid var(--color-accent)',
  paddingRight: '8px',
};

const deleteBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '18px',
  height: '18px',
  borderRadius: '50%',
  border: 'none',
  background: 'rgba(200, 123, 92, 0.15)',
  color: 'var(--color-accent)',
  cursor: 'pointer',
  padding: 0,
  flexShrink: 0,
  transition: 'background 0.15s ease',
};

const addPillStyle: React.CSSProperties = {
  ...basePillStyle,
  background: 'transparent',
  color: 'var(--color-text-muted)',
  border: '1.5px dashed var(--color-border-hover)',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(28, 25, 22, 0.4)',
  zIndex: 100,
  display: 'flex',
  alignItems: 'flex-end',
};

const sheetStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--color-surface)',
  borderRadius: '22px 22px 0 0',
  padding: '12px 24px 40px',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-md)',
};

const sheetHandleStyle: React.CSSProperties = {
  width: '36px',
  height: '4px',
  borderRadius: '2px',
  background: 'var(--color-border-hover)',
  margin: '0 auto var(--space-sm)',
};

const sheetTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 500,
  fontSize: '20px',
  color: 'var(--color-text-primary)',
  margin: 0,
};

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const fieldLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--color-text-faint)',
};

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--color-danger)',
  margin: 0,
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  marginTop: 'var(--space-xs)',
};

const cancelBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: '12px',
  borderRadius: 'var(--radius-full)',
  border: '1px solid var(--color-border)',
  background: 'transparent',
  color: 'var(--color-text-secondary)',
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '14px',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

const addBtnStyle: React.CSSProperties = {
  flex: 2,
  padding: '12px',
  borderRadius: 'var(--radius-full)',
  border: 'none',
  background: 'var(--color-text-primary)',
  color: '#ffffff',
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '14px',
  cursor: 'pointer',
  boxShadow: 'var(--shadow-btn)',
  transition: 'all 0.15s ease',
};
