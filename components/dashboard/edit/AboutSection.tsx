'use client';

import { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { updateProfileDirect } from '@/lib/actions/auth.actions';

interface Props {
  userId: string;
  initialBio: string | null;
  onChange: (html: string) => void;
}

type Status = 'idle' | 'saving' | 'saved' | 'error';

export default function AboutSection({ userId, initialBio, onChange }: Props) {
  const [status, setStatus]   = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
    ],
    content: initialBio ?? '',
    editorProps: {
      attributes: {
        style: [
          'min-height:150px',
          'border:1.5px solid #EBEBEB',
          'border-radius:12px',
          'padding:14px',
          'font-family:var(--font-body)',
          'font-size:15px',
          'color:#1C1916',
          'outline:none',
          'line-height:1.65',
        ].join(';'),
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  const handleAddLink = useCallback(() => {
    if (!editor || !linkUrl.trim()) return;
    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    setShowLinkPopover(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  async function handleSave() {
    if (!editor) return;
    setStatus('saving');
    setErrorMsg('');
    const html = editor.getHTML();
    const result = await updateProfileDirect(userId, { bio: html === '<p></p>' ? null : html });
    if (result.error) {
      setStatus('error');
      setErrorMsg(result.error);
    } else {
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

  return (
    <div style={cardStyle}>
      <p style={titleStyle}>About me</p>
      <p style={subtitleStyle}>Tell your supporters who you are</p>

      {/* Toolbar */}
      <div style={toolbarStyle}>
        <button
          type="button"
          title="Bold"
          onMouseDown={e => { e.preventDefault(); editor?.chain().focus().toggleBold().run(); }}
          style={toolBtnStyle(!!editor?.isActive('bold'))}
        >
          <strong>B</strong>
        </button>
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            title="Link"
            onMouseDown={e => { e.preventDefault(); setShowLinkPopover(v => !v); }}
            style={toolBtnStyle(!!editor?.isActive('link'))}
          >
            <LinkIcon />
          </button>
          {showLinkPopover && (
            <div style={popoverStyle}>
              <input
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddLink(); }}
                autoFocus
                style={popoverInputStyle}
              />
              <button type="button" onClick={handleAddLink} style={popoverBtnStyle}>
                Add link
              </button>
            </div>
          )}
        </div>
      </div>

      <EditorContent editor={editor} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 12, gap: 12 }}>
        {status === 'saved' && <span style={successStyle}>Saved ✓</span>}
        {status === 'error'  && <span style={errorStyle}>{errorMsg}</span>}
        <button
          type="button"
          onClick={handleSave}
          disabled={status === 'saving'}
          style={saveBtnStyle(status === 'saving')}
        >
          {status === 'saving' ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: 16,
  border: '1px solid #EBEBEB',
  padding: 28,
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 15,
  color: '#1C1916',
  margin: '0 0 4px',
};

const subtitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#9A9089',
  margin: '0 0 16px',
};

const toolbarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  marginBottom: 8,
  padding: '6px 8px',
  background: '#F9F9F9',
  border: '1.5px solid #EBEBEB',
  borderRadius: 8,
  width: 'fit-content',
};

function toolBtnStyle(active: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    background: active ? '#D7D744' : 'transparent',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    color: '#1C1916',
  };
}

const popoverStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  left: 0,
  background: '#ffffff',
  border: '1px solid #EBEBEB',
  borderRadius: 10,
  padding: 12,
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  zIndex: 50,
  display: 'flex',
  gap: 8,
  minWidth: 280,
};

const popoverInputStyle: React.CSSProperties = {
  flex: 1,
  height: 36,
  border: '1.5px solid #EBEBEB',
  borderRadius: 8,
  padding: '0 10px',
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#1C1916',
  outline: 'none',
};

const popoverBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: 13,
  color: '#000000',
  background: '#D7D744',
  border: 'none',
  borderRadius: 8,
  padding: '0 14px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
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

const successStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#3D9B56',
};

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#E07070',
};
