'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { deleteTag } from '@/lib/actions/tag.actions';
import { formatCurrency } from '@/lib/utils/currency';
import AddTagModal from '@/components/dashboard/AddTagModal';
import EditTagModal from '@/components/dashboard/EditTagModal';
import Toast from '@/components/dashboard/Toast';
import type { GiftTag, Currency } from '@/types';

interface Props {
  tags: GiftTag[];
  userId: string;
  currency: Currency;
}

type ToastState = { message: string; variant: 'success' | 'error' } | null;

export default function TagsClient({ tags: initialTags, userId, currency }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [tags, setTags] = useState<GiftTag[]>(initialTags);
  const [addOpen, setAddOpen] = useState(false);
  const [editTag, setEditTag] = useState<GiftTag | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  // Keep local tags in sync after server refresh
  useEffect(() => {
    setTags(initialTags);
  }, [initialTags]);

  const dismissToast = useCallback(() => setToast(null), []);

  function showToast(message: string, variant: 'success' | 'error' = 'success') {
    setToast({ message, variant });
  }

  function handleAddSuccess(tag: GiftTag) {
    setAddOpen(false);
    setTags(prev => [...prev, tag]);
    showToast('Tag added ✓');
    startTransition(() => router.refresh());
  }

  function handleEditSuccess(updated: GiftTag) {
    setEditTag(null);
    setTags(prev => prev.map(t => t.id === updated.id ? updated : t));
    showToast('Changes saved ✓');
    startTransition(() => router.refresh());
  }

  async function handleDelete(tagId: string) {
    setDeletingId(tagId);
    setConfirmDeleteId(null);
    // Optimistic remove
    setTags(prev => prev.filter(t => t.id !== tagId));
    const result = await deleteTag(tagId, userId);
    setDeletingId(null);
    if (result.error) {
      // Restore on failure
      setTags(initialTags);
      showToast(result.error, 'error');
    } else {
      showToast('Tag removed');
      startTransition(() => router.refresh());
    }
  }

  const customTags = tags.filter(t => !t.is_default);
  const defaultTag = tags.find(t => t.is_default);

  return (
    <>
      <div style={pageStyle}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 className="k-dash-page-title">Gift tags</h1>
          <p style={subtitleStyle}>
            Supporters see these as quick-pick amounts on your gift page.
          </p>
        </div>

        {/* Default tag */}
        {defaultTag && (
          <div style={cardStyle}>
            <p style={sectionLabelStyle}>Default tag</p>
            <div style={tagRowStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <span style={systemBadgeStyle}>SYSTEM</span>
                <div style={{ minWidth: 0 }}>
                  <p style={tagLabelStyle}>{defaultTag.label}</p>
                  <p style={tagAmountStyle}>{formatCurrency(defaultTag.amount, currency)}</p>
                </div>
              </div>
              <span style={lockedStyle}>Cannot be edited</span>
            </div>
          </div>
        )}

        {/* Custom tags */}
        <div style={{ ...cardStyle, marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: customTags.length > 0 ? '4px' : '0' }}>
            <p style={sectionLabelStyle}>Your tags</p>
            <button type="button" onClick={() => setAddOpen(true)} style={addBtnStyle}>
              + Add tag
            </button>
          </div>

          {customTags.length === 0 ? (
            <p style={emptyStyle}>
              No custom tags yet.{' '}
              <button type="button" onClick={() => setAddOpen(true)} style={emptyLinkStyle}>
                Add one
              </button>{' '}
              to give supporters quick amounts to choose from.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {customTags.map((tag, i) => {
                const isLast = i === customTags.length - 1;
                const isDeleting = deletingId === tag.id;
                const isConfirming = confirmDeleteId === tag.id;

                return (
                  <li
                    key={tag.id}
                    style={{
                      ...tagRowStyle,
                      borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
                      opacity: isDeleting ? 0.4 : 1,
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    {/* Left */}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={tagLabelStyle}>{tag.label}</p>
                      <p style={tagAmountStyle}>{formatCurrency(tag.amount, currency)}</p>
                    </div>

                    {/* Right: actions */}
                    {isConfirming ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <span style={confirmTextStyle}>Remove?</span>
                        <button
                          type="button"
                          onClick={() => handleDelete(tag.id)}
                          style={confirmYesStyle}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          style={confirmNoStyle}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => setEditTag(tag)}
                          disabled={isDeleting}
                          style={editBtnStyle}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(tag.id)}
                          disabled={isDeleting}
                          style={deleteBtnStyle}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Modals */}
      {addOpen && (
        <AddTagModal
          userId={userId}
          currency={currency}
          onClose={() => setAddOpen(false)}
          onSuccess={handleAddSuccess}
        />
      )}
      {editTag && (
        <EditTagModal
          tag={editTag}
          userId={userId}
          currency={currency}
          onClose={() => setEditTag(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onDismiss={dismissToast}
        />
      )}
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  padding: '24px 0 0',
};

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 500,
  fontSize: '24px',
  color: 'var(--color-text-primary)',
  margin: '0 0 4px',
};

const subtitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-secondary)',
  margin: 0,
  lineHeight: 1.5,
};

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--shadow-card)',
  padding: '20px',
};

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--color-text-faint)',
  margin: '0 0 12px',
};

const tagRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '12px 0',
};

const systemBadgeStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '10px',
  letterSpacing: '0.08em',
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

const lockedStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  color: 'var(--color-text-faint)',
  flexShrink: 0,
};

const addBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '13px',
  color: 'var(--color-accent)',
  background: 'none',
  border: 'none',
  padding: '4px 0',
  cursor: 'pointer',
  flexShrink: 0,
};

const emptyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-muted)',
  margin: '4px 0 0',
  lineHeight: 1.6,
};

const emptyLinkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '14px',
  color: 'var(--color-accent)',
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  textDecoration: 'underline',
};

const editBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '13px',
  color: 'var(--color-text-secondary)',
  background: 'none',
  border: 'none',
  padding: '8px 10px',
  minHeight: '40px',
  cursor: 'pointer',
  borderRadius: 'var(--radius-sm)',
  transition: 'background 0.1s ease',
};

const deleteBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '13px',
  color: 'var(--color-danger)',
  background: 'none',
  border: 'none',
  padding: '8px 10px',
  minHeight: '40px',
  cursor: 'pointer',
  borderRadius: 'var(--radius-sm)',
  transition: 'background 0.1s ease',
};

const confirmTextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--color-text-primary)',
};

const confirmYesStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '13px',
  color: '#fff',
  background: 'var(--color-danger)',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  padding: '6px 12px',
  cursor: 'pointer',
  minHeight: '32px',
};

const confirmNoStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '13px',
  color: 'var(--color-text-secondary)',
  background: 'transparent',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  padding: '6px 12px',
  cursor: 'pointer',
  minHeight: '32px',
};
