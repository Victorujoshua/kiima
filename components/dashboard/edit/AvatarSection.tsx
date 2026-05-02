'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { updateProfileDirect } from '@/lib/actions/auth.actions';

interface Props {
  userId: string;
  initialAvatarUrl: string | null;
  displayName: string;
  onChange: (url: string | null) => void;
}

type Status = 'idle' | 'saving' | 'saved' | 'error';

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function AvatarSection({ userId, initialAvatarUrl, displayName, onChange }: Props) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [preview, setPreview]     = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [status, setStatus]       = useState<Status>('idle');
  const [errorMsg, setErrorMsg]   = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewFile(file);
    setPreview(URL.createObjectURL(file));
    setStatus('idle');
  }

  function handleCancel() {
    setPreview(null);
    setPreviewFile(null);
    setStatus('idle');
    if (inputRef.current) inputRef.current.value = '';
  }

  async function handleSavePhoto() {
    if (!previewFile) return;
    setStatus('saving');
    setErrorMsg('');

    const supabase = createClient();
    const ext  = previewFile.name.split('.').pop() ?? 'jpg';
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, previewFile, { upsert: true });

    if (uploadError) {
      setStatus('error');
      setErrorMsg('Upload failed — try again.');
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    const urlWithBust = `${publicUrl}?t=${Date.now()}`;

    const result = await updateProfileDirect(userId, { avatar_url: publicUrl });
    if (result.error) {
      setStatus('error');
      setErrorMsg(result.error);
      return;
    }

    setAvatarUrl(urlWithBust);
    setPreview(null);
    setPreviewFile(null);
    onChange(urlWithBust);
    setStatus('saved');
    setTimeout(() => setStatus('idle'), 3000);
    if (inputRef.current) inputRef.current.value = '';
  }

  async function handleRemove() {
    setStatus('saving');
    const result = await updateProfileDirect(userId, { avatar_url: null });
    if (result.error) {
      setStatus('error');
      setErrorMsg(result.error);
      return;
    }
    setAvatarUrl(null);
    setPreview(null);
    setPreviewFile(null);
    onChange(null);
    setStatus('saved');
    setTimeout(() => setStatus('idle'), 3000);
    if (inputRef.current) inputRef.current.value = '';
  }

  const displayUrl = preview ?? avatarUrl;

  return (
    <div style={cardStyle}>
      <p style={titleStyle}>Profile photo</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Avatar */}
        <div style={avatarWrapStyle}>
          {displayUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={displayUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          ) : (
            <span style={initialsStyle}>{getInitials(displayName)}</span>
          )}
        </div>

        {/* Actions */}
        {!preview ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button type="button" onClick={() => inputRef.current?.click()} style={changePhotoBtn}>
              <CameraIcon /> Change photo
            </button>
            {avatarUrl && (
              <button type="button" onClick={handleRemove} disabled={status === 'saving'} style={removeLinkStyle}>
                Remove photo
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button type="button" onClick={handleSavePhoto} disabled={status === 'saving'} style={savePhotoBtnStyle}>
              {status === 'saving' ? 'Saving…' : 'Save photo'}
            </button>
            <button type="button" onClick={handleCancel} style={cancelLinkStyle}>
              Cancel
            </button>
          </div>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

      {status === 'saved' && <p style={successStyle}>Photo updated ✓</p>}
      {status === 'error' && <p style={errorStyle}>{errorMsg}</p>}
    </div>
  );
}

function CameraIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
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
  margin: '0 0 20px',
};

const avatarWrapStyle: React.CSSProperties = {
  width: 80,
  height: 80,
  borderRadius: '50%',
  background: '#F5F0EB',
  border: '1px solid #EBEBEB',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  flexShrink: 0,
};

const initialsStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 26,
  color: '#1C1916',
};

const changePhotoBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: 13,
  color: '#1C1916',
  background: 'none',
  border: '1.5px solid #EBEBEB',
  borderRadius: 100,
  padding: '8px 16px',
  cursor: 'pointer',
};

const removeLinkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#9A9089',
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  textAlign: 'left',
};

const savePhotoBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 13,
  color: '#000000',
  background: '#D7D744',
  border: 'none',
  borderRadius: 100,
  padding: '10px 20px',
  cursor: 'pointer',
};

const cancelLinkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#9A9089',
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  textAlign: 'left',
};

const successStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#3D9B56',
  margin: '12px 0 0',
};

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#E07070',
  margin: '12px 0 0',
};
