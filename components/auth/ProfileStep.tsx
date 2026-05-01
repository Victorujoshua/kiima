'use client';

import { useState, useRef } from 'react';
import { createProfile, uploadAvatar } from '@/lib/actions/auth.actions';
import type { Currency } from '@/types';

const CURRENCIES: { code: Currency; label: string }[] = [
  { code: 'NGN', label: '₦ NGN' },
  { code: 'USD', label: '$ USD' },
  { code: 'GBP', label: '£ GBP' },
  { code: 'EUR', label: '€ EUR' },
];

interface Props {
  userId: string;
  email: string;
  username: string;
  onNext: () => void;
}

export default function ProfileStep({ userId, email, username, onNext }: Props) {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio]                 = useState('');
  const [socialLink, setSocialLink]   = useState('');
  const [currency, setCurrency]       = useState<Currency>('NGN');
  const [avatarFile, setAvatarFile]   = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [nameErr, setNameErr]         = useState('');
  const [loading, setLoading]         = useState(false);
  const [globalErr, setGlobalErr]     = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = ev => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleContinue() {
    setNameErr('');
    setGlobalErr('');

    if (!displayName.trim()) {
      setNameErr('Please enter your name.');
      return;
    }

    if (socialLink && !socialLink.startsWith('https://')) {
      setGlobalErr('Social link must start with https://');
      return;
    }

    setLoading(true);

    let avatarUrl: string | null = null;
    if (avatarFile) {
      const fd = new FormData();
      fd.append('avatar', avatarFile);
      const { url, error } = await uploadAvatar(userId, fd);
      if (error) {
        setGlobalErr(error);
        setLoading(false);
        return;
      }
      avatarUrl = url ?? null;
    }

    const result = await createProfile({
      userId,
      email,
      username,
      displayName: displayName.trim(),
      bio: bio.trim() || undefined,
      avatarUrl,
      currency,
      socialLink: socialLink.trim() || undefined,
    });

    setLoading(false);

    if (result.error) {
      setGlobalErr(result.error);
      return;
    }

    onNext();
  }

  return (
    <div>
      <h1 style={headingStyle}>Complete your page</h1>
      <p style={subStyle}>Tell your supporters a bit about yourself.</p>

      <div className="k-signup-profile-grid">
        {/* Avatar column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: '#f3f3f3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#B5AAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={uploadBtnStyle}
          >
            <CameraIcon />
            {avatarPreview ? 'Change photo' : 'Upload photo'}
          </button>
        </div>

        {/* Fields column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Name */}
          <div>
            <label style={labelStyle}>Name</label>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Name"
              style={{ ...fieldInputStyle, borderColor: nameErr ? '#E07070' : '#e8e8e8' }}
            />
            {nameErr && <p style={fieldErrStyle}>{nameErr}</p>}
          </div>

          {/* About */}
          <div>
            <label style={labelStyle}>About</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Write about your passion and what drives you. Explain how contributions can make a difference in your work and create a connection with your supporters..."
              rows={4}
              style={textareaStyle}
            />
          </div>

          {/* Social link */}
          <div>
            <label style={labelStyle}>Website or social link</label>
            <input
              value={socialLink}
              onChange={e => setSocialLink(e.target.value)}
              placeholder="https://"
              type="url"
              style={{ ...fieldInputStyle, borderColor: '#e8e8e8' }}
            />
          </div>

          {/* Currency */}
          <div>
            <label style={labelStyle}>Currency</label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value as Currency)}
              style={selectStyle}
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {globalErr && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#E07070', marginTop: 16 }}>
          {globalErr}
        </p>
      )}

      <button
        onClick={handleContinue}
        disabled={loading}
        style={{ ...ctaBtnStyle, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 28 }}
      >
        {loading ? 'Setting up...' : 'Continue →'}
      </button>
    </div>
  );
}

function CameraIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 800,
  fontSize: 32,
  color: '#1C1916',
  letterSpacing: '-0.5px',
  margin: '0 0 8px',
  textAlign: 'center',
};

const subStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 16,
  color: '#9A9089',
  margin: '0 0 32px',
  textAlign: 'center',
};

const uploadBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  background: '#ffffff',
  border: '1.5px solid #1C1916',
  borderRadius: 100,
  padding: '8px 16px',
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  color: '#1C1916',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#B5AAAA',
  marginBottom: 6,
};

const fieldInputStyle: React.CSSProperties = {
  width: '100%',
  background: '#f3f3f3',
  border: '1.5px solid #e8e8e8',
  borderRadius: 14,
  padding: '12px 16px',
  fontFamily: 'var(--font-body)',
  fontSize: 15,
  color: '#1C1916',
  outline: 'none',
  boxSizing: 'border-box',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  background: '#f3f3f3',
  border: '1.5px solid #e8e8e8',
  borderRadius: 14,
  padding: '12px 16px',
  fontFamily: 'var(--font-body)',
  fontSize: 15,
  color: '#1C1916',
  outline: 'none',
  resize: 'vertical',
  boxSizing: 'border-box',
  lineHeight: 1.6,
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  background: '#f3f3f3',
  border: '1.5px solid #e8e8e8',
  borderRadius: 14,
  padding: '12px 16px',
  fontFamily: 'var(--font-body)',
  fontSize: 15,
  color: '#1C1916',
  outline: 'none',
  cursor: 'pointer',
  appearance: 'none',
};

const fieldErrStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 12,
  color: '#E07070',
  margin: '6px 0 0',
};

const ctaBtnStyle: React.CSSProperties = {
  width: '100%',
  background: '#D7D744',
  color: '#1C1916',
  border: 'none',
  borderRadius: 100,
  padding: '16px',
  fontFamily: 'var(--font-body)',
  fontWeight: 800,
  fontSize: 16,
  cursor: 'pointer',
  transition: 'opacity 0.15s ease',
};
