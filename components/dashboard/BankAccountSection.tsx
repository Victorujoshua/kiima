'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getBanks, lookupAccountName, saveBankDetails } from '@/lib/actions/bank.actions';
import type { PaystackBank } from '@/lib/actions/bank.actions';

interface Props {
  userId:        string;
  bankName:      string | null;
  accountNumber: string | null;
  accountName:   string | null;
  onSaved:       (msg: string) => void;
  onError:       (msg: string) => void;
}

export default function BankAccountSection({ userId, bankName, accountNumber, accountName, onSaved, onError }: Props) {
  const hasDetails = !!(bankName && accountNumber && accountName);
  const [editing, setEditing]         = useState(!hasDetails);
  const [banks, setBanks]             = useState<PaystackBank[]>([]);
  const [bankSearch, setBankSearch]   = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<PaystackBank | null>(null);
  const [accNumber, setAccNumber]     = useState('');
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [saving, setSaving]           = useState(false);
  const dropdownRef                   = useRef<HTMLDivElement>(null);

  // Load banks once when editing opens
  useEffect(() => {
    if (!editing) return;
    getBanks().then(r => { if (r.banks) setBanks(r.banks); });
  }, [editing]);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-lookup when account number reaches 10 digits
  useEffect(() => {
    if (accNumber.length !== 10 || !selectedBank) {
      setResolvedName(null);
      setLookupError(null);
      return;
    }
    setLookupLoading(true);
    setResolvedName(null);
    setLookupError(null);
    lookupAccountName(accNumber, selectedBank.code).then(r => {
      setLookupLoading(false);
      if (r.accountName) setResolvedName(r.accountName);
      else setLookupError(r.error ?? 'Could not verify account.');
    });
  }, [accNumber, selectedBank]);

  const filteredBanks = bankSearch.trim()
    ? banks.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase()))
    : banks;

  function selectBank(b: PaystackBank) {
    setSelectedBank(b);
    setBankSearch(b.name);
    setDropdownOpen(false);
    setResolvedName(null);
    setLookupError(null);
  }

  const handleSave = useCallback(async () => {
    if (!selectedBank || !resolvedName || accNumber.length !== 10) return;
    setSaving(true);
    const result = await saveBankDetails(userId, selectedBank.name, selectedBank.code, accNumber, resolvedName);
    setSaving(false);
    if (result.error) {
      onError(result.error);
    } else {
      onSaved('Payout account saved ✓');
      setEditing(false);
    }
  }, [selectedBank, resolvedName, accNumber, userId, onSaved, onError]);

  // ── Display state ──────────────────────────────────────────────────────────
  if (!editing) {
    const masked = accountNumber ? `••••••${accountNumber.slice(-4)}` : '';
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <p style={detailNameStyle}>{accountName}</p>
            <p style={detailMetaStyle}>{bankName} · {masked}</p>
          </div>
          <button type="button" onClick={() => setEditing(true)} style={changeBtnStyle}>
            Update
          </button>
        </div>
        <div style={verifiedBadgeStyle}>
          <span style={{ fontSize: 14 }}>✓</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>Payout account connected</span>
        </div>
      </div>
    );
  }

  // ── Edit / setup form ──────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {hasDetails && (
        <button type="button" onClick={() => setEditing(false)} style={cancelLinkStyle}>
          ← Cancel
        </button>
      )}

      {/* Bank selector */}
      <div>
        <label style={fieldLabelStyle}>Bank</label>
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search bank…"
            value={bankSearch}
            onChange={e => { setBankSearch(e.target.value); setDropdownOpen(true); setSelectedBank(null); }}
            onFocus={() => setDropdownOpen(true)}
            style={inputStyle}
          />
          {dropdownOpen && filteredBanks.length > 0 && (
            <div style={dropdownStyle}>
              {filteredBanks.slice(0, 8).map(b => (
                <button
                  key={b.code}
                  type="button"
                  onMouseDown={() => selectBank(b)}
                  style={{
                    ...dropdownItemStyle,
                    background: selectedBank?.code === b.code ? '#F5F5CC' : 'transparent',
                    fontWeight: selectedBank?.code === b.code ? 700 : 500,
                  }}
                >
                  {b.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Account number */}
      <div>
        <label style={fieldLabelStyle}>Account number</label>
        <input
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder="10-digit account number"
          value={accNumber}
          onChange={e => setAccNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
          style={inputStyle}
        />
      </div>

      {/* Lookup result */}
      {lookupLoading && (
        <p style={lookupMetaStyle}>Verifying account…</p>
      )}
      {resolvedName && (
        <div style={resolvedCardStyle}>
          <span style={{ fontSize: 14 }}>✓</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#1C1916' }}>{resolvedName}</span>
        </div>
      )}
      {lookupError && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-danger)', margin: 0 }}>
          {lookupError}
        </p>
      )}

      {/* Save */}
      <button
        type="button"
        onClick={handleSave}
        disabled={!resolvedName || saving}
        style={saveBtnStyle(!resolvedName || saving)}
      >
        {saving ? 'Saving…' : 'Save payout account'}
      </button>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const fieldLabelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--color-text-faint)',
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 48,
  border: '1.5px solid #EBEBEB',
  borderRadius: 12,
  background: '#ffffff',
  fontFamily: 'var(--font-body)',
  fontSize: 15,
  color: 'var(--color-text-primary)',
  padding: '0 14px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease',
};

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 4px)',
  left: 0,
  right: 0,
  background: '#ffffff',
  border: '1px solid #EBEBEB',
  borderRadius: 12,
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  zIndex: 20,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  maxHeight: 240,
  overflowY: 'auto',
};

const dropdownItemStyle: React.CSSProperties = {
  padding: '10px 14px',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  color: 'var(--color-text-primary)',
  cursor: 'pointer',
  border: 'none',
  textAlign: 'left',
  transition: 'background 0.1s ease',
};

const resolvedCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  background: '#EEF8F0',
  border: '1px solid #B8E4C4',
  borderRadius: 12,
  padding: '12px 16px',
  color: '#3D9B56',
};

const verifiedBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  background: '#EEF8F0',
  border: '1px solid #B8E4C4',
  borderRadius: 100,
  padding: '6px 14px',
  color: '#3D9B56',
};

const detailNameStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 15,
  color: '#1C1916',
  margin: 0,
};

const detailMetaStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#9A9089',
  margin: '3px 0 0',
};

const changeBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: 13,
  color: '#FF5C00',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  flexShrink: 0,
};

const cancelLinkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: 13,
  color: '#9A9089',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  alignSelf: 'flex-start',
};

const lookupMetaStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#9A9089',
  margin: 0,
};

function saveBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    width: '100%',
    height: 48,
    background: disabled ? '#E0DBDB' : '#000000',
    color: disabled ? '#9A9089' : '#ffffff',
    border: 'none',
    borderRadius: 100,
    fontFamily: 'var(--font-body)',
    fontWeight: 700,
    fontSize: 15,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 0.15s ease',
  };
}
