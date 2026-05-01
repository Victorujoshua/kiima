'use client';

import { useState, useRef, useEffect, useCallback, useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { updateProfile } from '@/lib/actions/auth.actions';
import SocialLinksForm from '@/components/forms/SocialLinksForm';
import Toast from '@/components/dashboard/Toast';
import type { Profile, SocialLink } from '@/types';

interface Props {
  profile: Profile;
  email: string;
  links: SocialLink[];
}

type ToastState = { message: string; variant: 'success' | 'error' } | null;

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} style={saveBtnStyle(pending)}>
      {pending ? 'Saving…' : 'Save changes'}
    </button>
  );
}

export default function SettingsClient({ profile, email, links }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url);
  const [avatarPending, setAvatarPending] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const [state, formAction] = useFormState(updateProfile, null);

  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (state?.success) {
      setToast({ message: 'Profile saved ✓', variant: 'success' });
      startTransition(() => router.refresh());
    } else if (state?.error) {
      setToast({ message: state.error, variant: 'error' });
    }
  }, [state, router]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarPending(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${profile.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (uploadError) {
        setToast({ message: 'Upload failed — try again.', variant: 'error' });
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      // Add cache-busting so the browser picks up the new image
      setAvatarUrl(`${publicUrl}?t=${Date.now()}`);
    } finally {
      setAvatarPending(false);
    }
  }

  function getInitials(name: string) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  return (
    <>
      <div style={pageStyle}>
        <h1 className="k-dash-page-title">Settings</h1>

        {/* ── Profile section ── */}
        <div style={cardStyle}>
          <p style={sectionLabel}>Profile</p>

          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarPending}
              style={avatarBtnStyle}
              aria-label="Change avatar"
            >
              {avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={avatarUrl} alt={profile.display_name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <span style={initialsStyle}>{getInitials(profile.display_name)}</span>
              )}
              {!avatarPending && (
                <span style={avatarOverlayStyle}>Edit</span>
              )}
              {avatarPending && (
                <span style={avatarOverlayStyle}>…</span>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                {profile.display_name}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                @{profile.username}
              </p>
            </div>
          </div>

          {/* Profile form */}
          <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="hidden" name="user_id" value={profile.id} />
            <input type="hidden" name="avatar_url" value={avatarUrl ?? ''} />

            <div>
              <label style={fieldLabel}>Display name</label>
              <input
                name="display_name"
                type="text"
                defaultValue={profile.display_name}
                autoComplete="name"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={fieldLabel}>
                Bio{' '}
                <span style={{ color: 'var(--color-text-faint)', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                name="bio"
                defaultValue={profile.bio ?? ''}
                placeholder="Tell your supporters a little about yourself…"
                rows={3}
                style={textareaStyle}
              />
            </div>

            <SaveButton />
          </form>
        </div>

        {/* ── Social links section ── */}
        <div style={{ marginTop: '12px' }}>
          <p style={{ ...sectionLabel, padding: '0 4px', marginBottom: '8px' }}>Social links</p>
          <SocialLinksForm userId={profile.id} existingLinks={links} />
        </div>

        {/* ── Account section ── */}
        <div style={{ ...cardStyle, marginTop: '12px' }}>
          <p style={sectionLabel}>Account</p>

          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-faint)', margin: '0 0 2px' }}>Email</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>{email}</p>
          </div>

          {/* Change password */}
          <ChangePasswordRow onToast={setToast} />

          <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '20px', paddingTop: '20px' }}>
            <LogoutRow />
          </div>
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />
      )}
    </>
  );
}

function ChangePasswordRow({ onToast }: { onToast: (t: ToastState) => void }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      onToast({ message: 'Password must be at least 8 characters.', variant: 'error' });
      return;
    }
    if (password !== confirm) {
      onToast({ message: 'Passwords don\'t match.', variant: 'error' });
      return;
    }
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setPending(false);
    if (error) {
      onToast({ message: error.message, variant: 'error' });
    } else {
      onToast({ message: 'Password updated ✓', variant: 'success' });
      setPassword('');
      setConfirm('');
      setOpen(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-faint)', margin: '0 0 2px' }}>Password</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>••••••••</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '13px', color: '#FF5C00', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          {open ? 'Cancel' : 'Change'}
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={fieldLabel}>New password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={fieldLabel}>Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat new password"
              autoComplete="new-password"
              style={inputStyle}
            />
          </div>
          <button type="submit" disabled={pending} style={saveBtnStyle(pending)}>
            {pending ? 'Updating…' : 'Update password'}
          </button>
        </form>
      )}
    </div>
  );
}

function LogoutRow() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <button type="button" onClick={handleLogout} style={logoutBtnStyle}>
      Log out
    </button>
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
  margin: '0 0 20px',
};

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: 16,
  border: '1px solid #EBEBEB',
  padding: 28,
};

const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--color-text-faint)',
  margin: '0 0 16px',
};

const avatarBtnStyle: React.CSSProperties = {
  width: '72px',
  height: '72px',
  borderRadius: '50%',
  background: '#FFF0EB',
  border: '1px solid #EBEBEB',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
  overflow: 'hidden',
  position: 'relative',
  padding: 0,
  transition: 'border-color 0.15s ease',
};

const initialsStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '22px',
  color: 'var(--color-accent)',
};

const avatarOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(28,25,22,0.45)',
  color: '#fff',
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '12px',
  opacity: 0,
  transition: 'opacity 0.15s ease',
  // shown on hover via CSS — we use an inline workaround below
};

const fieldLabel: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--color-text-faint)',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '48px',
  border: '1.5px solid #EBEBEB',
  borderRadius: 12,
  background: '#ffffff',
  fontFamily: 'var(--font-body)',
  fontSize: '15px',
  color: 'var(--color-text-primary)',
  padding: '0 14px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  border: '1.5px solid #EBEBEB',
  borderRadius: 12,
  background: '#ffffff',
  fontFamily: 'var(--font-body)',
  fontSize: '15px',
  color: 'var(--color-text-primary)',
  padding: '12px 14px',
  outline: 'none',
  resize: 'vertical',
  boxSizing: 'border-box',
  lineHeight: 1.5,
  transition: 'border-color 0.15s ease',
};

function saveBtnStyle(pending: boolean): React.CSSProperties {
  return {
    width: '100%',
    height: '48px',
    background: pending ? '#9A9089' : '#000000',
    color: '#fff',
    border: 'none',
    borderRadius: 100,
    fontFamily: 'var(--font-body)',
    fontWeight: 700,
    fontSize: '15px',
    cursor: pending ? 'not-allowed' : 'pointer',
    transition: 'background 0.15s ease',
  };
}

const logoutBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '14px',
  color: 'var(--color-danger)',
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  minHeight: '44px',
  display: 'flex',
  alignItems: 'center',
};
