'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getBanks, lookupAccountName, saveBankDetails } from '@/lib/actions/bank.actions';
import OtpInput from '@/components/auth/OtpInput';
import type { PaystackBank } from '@/lib/actions/bank.actions';

type Stage = 'display' | 'otp' | 'editing';

interface Props {
  userId:        string;
  email:         string;
  bankName:      string | null;
  accountNumber: string | null;
  accountName:   string | null;
  onSaved:       (msg: string) => void;
  onError:       (msg: string) => void;
}

export default function BankAccountSection({
  userId, email, bankName, accountNumber, accountName, onSaved, onError,
}: Props) {
  const hasDetails = !!(bankName && accountNumber && accountName);
  const [stage, setStage]             = useState<Stage>(hasDetails ? 'display' : 'editing');

  // ── OTP stage ──────────────────────────────────────────────────────────────
  const [otp, setOtp]                 = useState('');
  const [otpSending, setOtpSending]   = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError]       = useState<string | null>(null);
  const [cooldown, setCooldown]       = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function handleRequestOtp() {
    setOtpSending(true);
    setOtpError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.reauthenticate();
    setOtpSending(false);
    if (error) {
      setOtpError('Could not send code — try again.');
    } else {
      setStage('otp');
      setCooldown(60);
    }
  }

  async function handleVerifyOtp() {
    if (otp.length !== 6) return;
    setOtpVerifying(true);
    setOtpError(null);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'reauthentication' as any });
    setOtpVerifying(false);
    if (error) {
      setOtpError('Invalid or expired code. Try again.');
    } else {
      setOtp('');
      setStage('editing');
    }
  }

  async function handleResendOtp() {
    if (cooldown > 0) return;
    setOtpError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.reauthenticate();
    if (!error) setCooldown(60);
    else setOtpError('Could not resend — try again.');
  }

  // ── Edit form stage ─────────────────────────────────────────────────────────
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

  useEffect(() => {
    if (stage !== 'editing') return;
    getBanks().then(r => { if (r.banks) setBanks(r.banks); });
  }, [stage]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
      onSaved('Payout account updated ✓');
      setStage('display');
    }
  }, [selectedBank, resolvedName, accNumber, userId, onSaved, onError]);

  // ── RENDER: display ────────────────────────────────────────────────────────
  if (stage === 'display') {
    const masked = accountNumber ? `••••••${accountNumber.slice(-4)}` : '';
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <p style={detailNameStyle}>{accountName}</p>
            <p style={detailMetaStyle}>{bankName} · {masked}</p>
          </div>
          <button
            type="button"
            onClick={handleRequestOtp}
            disabled={otpSending}
            style={changeBtnStyle}
          >
            {otpSending ? 'Sending…' : 'Update'}
          </button>
        </div>
        <div style={verifiedBadgeStyle}>
          <span style={{ fontSize: 14 }}>✓</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>Payout account connected</span>
        </div>
        {otpError && <p style={errorStyle}>{otpError}</p>}
      </div>
    );
  }

  // ── RENDER: otp ────────────────────────────────────────────────────────────
  if (stage === 'otp') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <button type="button" onClick={() => { setStage('display'); setOtp(''); setOtpError(null); }} style={cancelLinkStyle}>
          ← Cancel
        </button>

        <div style={otpInfoCardStyle}>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, color: '#1C1916', margin: '0 0 4px' }}>
            Verify it&apos;s you
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#9A9089', margin: 0, lineHeight: 1.5 }}>
            A 6-digit code was sent to <strong style={{ color: '#1C1916' }}>{email}</strong>. Enter it below to continue.
          </p>
        </div>

        <OtpInput value={otp} onChange={setOtp} disabled={otpVerifying} />

        {otpError && <p style={errorStyle}>{otpError}</p>}

        <button
          type="button"
          onClick={handleVerifyOtp}
          disabled={otp.length !== 6 || otpVerifying}
          style={saveBtnStyle(otp.length !== 6 || otpVerifying)}
        >
          {otpVerifying ? 'Verifying…' : 'Verify & continue'}
        </button>

        <button type="button" onClick={handleResendOtp} disabled={cooldown > 0} style={resendBtnStyle}>
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
        </button>
      </div>
    );
  }

  // ── RENDER: editing ────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {hasDetails && (
        <button type="button" onClick={() => setStage('display')} style={cancelLinkStyle}>
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

      {lookupLoading && <p style={lookupMetaStyle}>Verifying account…</p>}
      {resolvedName && (
        <div style={resolvedCardStyle}>
          <span style={{ fontSize: 14 }}>✓</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#1C1916' }}>{resolvedName}</span>
        </div>
      )}
      {lookupError && <p style={errorStyle}>{lookupError}</p>}

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

const otpInfoCardStyle: React.CSSProperties = {
  background: '#F9F9F9',
  border: '1px solid #EBEBEB',
  borderRadius: 12,
  padding: '14px 16px',
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

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: 'var(--color-danger)',
  margin: 0,
};

const resendBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: 13,
  color: '#9A9089',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  alignSelf: 'center',
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
