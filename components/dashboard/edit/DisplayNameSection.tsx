'use client';

import { useState } from 'react';
import { updateProfileDirect } from '@/lib/actions/auth.actions';

interface Props {
  userId: string;
  initialValue: string;
  onChange: (name: string) => void;
}

type Status = 'idle' | 'saving' | 'saved' | 'error';

const MAX = 60;

export default function DisplayNameSection({ userId, initialValue, onChange }: Props) {
  const [value, setValue]   = useState(initialValue);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSave() {
    if (!value.trim()) return;
    setStatus('saving');
    setErrorMsg('');

    const result = await updateProfileDirect(userId, { display_name: value.trim() });
    if (result.error) {
      setStatus('error');
      setErrorMsg(result.error);
    } else {
      setStatus('saved');
      onChange(value.trim());
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

  return (
    <div style={cardStyle}>
      <p style={titleStyle}>Display name</p>

      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={value}
          maxLength={MAX}
          onChange={e => { setValue(e.target.value); if (status !== 'idle') setStatus('idle'); onChange(e.target.value); }}
          style={inputStyle}
        />
        <span style={charCountStyle}>{value.length}/{MAX}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 12, gap: 12 }}>
        {status === 'saved' && <span style={successStyle}>Saved ✓</span>}
        {status === 'error' && <span style={errorStyle}>{errorMsg}</span>}
        <button
          type="button"
          onClick={handleSave}
          disabled={status === 'saving' || !value.trim()}
          style={saveBtnStyle(status === 'saving' || !value.trim())}
        >
          {status === 'saving' ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
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
  margin: '0 0 16px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 48,
  border: '1.5px solid #EBEBEB',
  borderRadius: 12,
  background: '#ffffff',
  fontFamily: 'var(--font-body)',
  fontSize: 15,
  color: '#1C1916',
  padding: '0 52px 0 14px',
  outline: 'none',
  boxSizing: 'border-box',
};

const charCountStyle: React.CSSProperties = {
  position: 'absolute',
  right: 14,
  top: '50%',
  transform: 'translateY(-50%)',
  fontFamily: 'var(--font-body)',
  fontSize: 12,
  color: '#B5AAAA',
  pointerEvents: 'none',
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
