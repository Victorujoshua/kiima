'use client';

import { useState } from 'react';
import {
  upsertCreatorLink,
  deleteCreatorLink,
  reorderCreatorLinks,
} from '@/lib/actions/link.actions';
import type { CreatorLink } from '@/types';

interface Props {
  userId: string;
  initialLinks: CreatorLink[];
}

interface LinkForm {
  title: string;
  url: string;
  description: string;
  thumbnail_url: string;
}

const emptyForm: LinkForm = { title: '', url: '', description: '', thumbnail_url: '' };

export default function LinksManager({ userId, initialLinks }: Props) {
  const [links, setLinks]           = useState<CreatorLink[]>(initialLinks);
  const [editingId, setEditingId]   = useState<string | 'new' | null>(null);
  const [form, setForm]             = useState<LinkForm>(emptyForm);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState<string | null>(null);
  const [error, setError]           = useState('');
  const [flash, setFlash]           = useState('');

  function startNew() {
    setEditingId('new');
    setForm(emptyForm);
    setError('');
  }

  function startEdit(link: CreatorLink) {
    setEditingId(link.id);
    setForm({
      title: link.title,
      url: link.url,
      description: link.description ?? '',
      thumbnail_url: link.thumbnail_url ?? '',
    });
    setError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  }

  async function handleSave() {
    setSaving(true);
    setError('');

    const payload = {
      id: editingId === 'new' ? undefined : editingId ?? undefined,
      title: form.title,
      url: form.url,
      description: form.description,
      thumbnail_url: form.thumbnail_url,
    };

    const result = await upsertCreatorLink(userId, payload);
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.data) {
      if (editingId === 'new') {
        setLinks(prev => [...prev, result.data!]);
      } else {
        setLinks(prev => prev.map(l => l.id === result.data!.id ? result.data! : l));
      }
    }

    setEditingId(null);
    setForm(emptyForm);
    showFlash('Link saved!');
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    const result = await deleteCreatorLink(userId, id);
    setDeleting(null);

    if (result.error) {
      setError(result.error);
      return;
    }

    setLinks(prev => prev.filter(l => l.id !== id));
    showFlash('Link deleted.');
  }

  async function handleToggleActive(link: CreatorLink) {
    const updated = { ...link, is_active: !link.is_active };
    setLinks(prev => prev.map(l => l.id === link.id ? updated : l));

    const result = await upsertCreatorLink(userId, {
      id: link.id,
      title: link.title,
      url: link.url,
      description: link.description ?? '',
      thumbnail_url: link.thumbnail_url ?? '',
      is_active: !link.is_active,
    });

    if (result.error) {
      setLinks(prev => prev.map(l => l.id === link.id ? link : l));
      setError(result.error);
    }
  }

  async function handleMove(index: number, direction: 'up' | 'down') {
    const next = [...links];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= next.length) return;
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    setLinks(next);
    await reorderCreatorLinks(userId, next.map(l => l.id));
  }

  function showFlash(msg: string) {
    setFlash(msg);
    setTimeout(() => setFlash(''), 2500);
  }

  const isEditing = editingId !== null;

  return (
    <div style={containerStyle}>

      {/* Header row */}
      <div style={headerRowStyle}>
        <div>
          <p style={sectionTitleStyle}>Link cards</p>
          <p style={sectionSubStyle}>
            Cards appear on your public page below your embed. Max 10 links.
          </p>
        </div>
        {!isEditing && links.length < 10 && (
          <button type="button" onClick={startNew} style={addBtnStyle}>
            + Add link
          </button>
        )}
      </div>

      {/* Flash message */}
      {flash && <p style={flashStyle}>{flash}</p>}

      {/* Error */}
      {error && !isEditing && <p style={errorMsgStyle}>{error}</p>}

      {/* Link list */}
      {links.length === 0 && !isEditing && (
        <div style={emptyStateStyle}>
          <p style={emptyTextStyle}>No links yet — add your first one above.</p>
        </div>
      )}

      {links.map((link, index) => (
        <div key={link.id} style={linkRowStyle}>
          {/* Thumbnail preview */}
          {link.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={link.thumbnail_url} alt="" style={thumbPreviewStyle} />
          ) : (
            <div style={thumbPlaceholderStyle}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="2" width="14" height="14" rx="3" stroke="#B5AAAA" strokeWidth="1.5" />
                <path d="M2 12l4-4 3 3 3-4 4 5" stroke="#B5AAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={linkTitleStyle}>{link.title}</p>
            <p style={linkUrlStyle}>{link.url}</p>
          </div>

          {/* Active toggle */}
          <button
            type="button"
            onClick={() => handleToggleActive(link)}
            title={link.is_active ? 'Active — click to hide' : 'Hidden — click to show'}
            style={activeToggleStyle(link.is_active)}
          >
            {link.is_active ? 'Live' : 'Hidden'}
          </button>

          {/* Reorder */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <button
              type="button"
              onClick={() => handleMove(index, 'up')}
              disabled={index === 0}
              style={arrowBtnStyle(index === 0)}
              title="Move up"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => handleMove(index, 'down')}
              disabled={index === links.length - 1}
              style={arrowBtnStyle(index === links.length - 1)}
              title="Move down"
            >
              ↓
            </button>
          </div>

          {/* Edit */}
          <button
            type="button"
            onClick={() => startEdit(link)}
            style={iconBtnStyle}
            title="Edit"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" stroke="#5A4D44" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => handleDelete(link.id)}
            disabled={deleting === link.id}
            style={{ ...iconBtnStyle, color: '#E07070' }}
            title="Delete"
          >
            {deleting === link.id ? '…' : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 4h10M6 4V3h4v1M5 4l.5 9h5L11 4" stroke="#E07070" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      ))}

      {/* Add / edit form */}
      {isEditing && (
        <div style={formCardStyle}>
          <p style={formTitleStyle}>
            {editingId === 'new' ? 'New link' : 'Edit link'}
          </p>

          {error && <p style={errorMsgStyle}>{error}</p>}

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Title <span style={requiredStyle}>*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="My YouTube channel"
              style={inputStyle}
              maxLength={80}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>URL <span style={requiredStyle}>*</span></label>
            <input
              type="url"
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              placeholder="https://"
              style={inputStyle}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Description <span style={optionalStyle}>(optional)</span></label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Short description…"
              style={inputStyle}
              maxLength={120}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Thumbnail URL <span style={optionalStyle}>(optional)</span></label>
            <input
              type="url"
              value={form.thumbnail_url}
              onChange={e => setForm(f => ({ ...f, thumbnail_url: e.target.value }))}
              placeholder="https://…"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" onClick={cancelEdit} style={cancelBtnStyle}>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !form.title.trim() || !form.url.trim()}
              style={saveBtnStyle(saving || !form.title.trim() || !form.url.trim())}
            >
              {saving ? 'Saving…' : 'Save link'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const headerRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap',
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 15,
  color: '#1C1916',
  margin: '0 0 4px',
};

const sectionSubStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#9A9089',
  margin: 0,
};

const addBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 13,
  color: '#000000',
  background: '#D7D744',
  border: 'none',
  borderRadius: 100,
  padding: '10px 18px',
  cursor: 'pointer',
  flexShrink: 0,
  whiteSpace: 'nowrap',
};

const flashStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#3D9B56',
  margin: 0,
};

const errorMsgStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#E07070',
  margin: 0,
};

const emptyStateStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: 16,
  border: '1px solid #EBEBEB',
  padding: '32px 24px',
  textAlign: 'center',
};

const emptyTextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  color: '#B5AAAA',
  margin: 0,
};

const linkRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  background: '#ffffff',
  borderRadius: 16,
  border: '1px solid #EBEBEB',
  padding: '14px 16px',
};

const thumbPreviewStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 10,
  objectFit: 'cover',
  flexShrink: 0,
  display: 'block',
  background: '#F4F4F4',
};

const thumbPlaceholderStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 10,
  background: '#F4F4F4',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const linkTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: 14,
  color: '#1C1916',
  margin: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const linkUrlStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 12,
  color: '#9A9089',
  margin: '2px 0 0',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

function activeToggleStyle(active: boolean): React.CSSProperties {
  return {
    fontFamily: 'var(--font-body)',
    fontWeight: 700,
    fontSize: 11,
    color: active ? '#3D9B56' : '#9A9089',
    background: active ? '#EEF8F0' : '#F4F4F4',
    border: 'none',
    borderRadius: 100,
    padding: '5px 10px',
    cursor: 'pointer',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  };
}

function arrowBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    width: 22,
    height: 22,
    border: '1px solid #EBEBEB',
    borderRadius: 6,
    background: '#ffffff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-body)',
    fontSize: 12,
    color: disabled ? '#D5D5D5' : '#5A4D44',
    padding: 0,
    lineHeight: 1,
    opacity: disabled ? 0.4 : 1,
  };
}

const iconBtnStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  border: '1px solid #EBEBEB',
  borderRadius: 8,
  background: '#ffffff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  padding: 0,
};

const formCardStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: 16,
  border: '1px solid #EBEBEB',
  padding: 24,
};

const formTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 15,
  color: '#1C1916',
  margin: '0 0 20px',
};

const fieldGroupStyle: React.CSSProperties = {
  marginBottom: 14,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: 12,
  color: '#9A9089',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const requiredStyle: React.CSSProperties = {
  color: '#E07070',
};

const optionalStyle: React.CSSProperties = {
  color: '#B5AAAA',
  fontWeight: 400,
  textTransform: 'none',
  letterSpacing: 0,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 44,
  border: '1.5px solid #EBEBEB',
  borderRadius: 10,
  background: '#ffffff',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  color: '#1C1916',
  padding: '0 14px',
  outline: 'none',
  boxSizing: 'border-box',
};

const cancelBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: 14,
  color: '#9A9089',
  background: '#F4F4F4',
  border: 'none',
  borderRadius: 100,
  padding: '10px 20px',
  cursor: 'pointer',
};

function saveBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    fontFamily: 'var(--font-body)',
    fontWeight: 700,
    fontSize: 14,
    color: disabled ? '#9A9089' : '#000000',
    background: disabled ? '#F4F4F4' : '#D7D744',
    border: 'none',
    borderRadius: 100,
    padding: '10px 24px',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}
