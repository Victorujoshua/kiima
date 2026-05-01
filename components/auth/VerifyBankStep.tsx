'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getBanks, lookupAccountName, saveBankDetails, type PaystackBank } from '@/lib/actions/bank.actions';
import OtpInput from '@/components/auth/OtpInput';

interface Props {
  userId: string;
  email: string;
}

export default function VerifyBankStep({ userId, email }: Props) {
  const router = useRouter();

  // OTP state
  const [otp, setOtp]               = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError]     = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [cooldown, setCooldown]     = useState(0);
  const [resending, setResending]   = useState(false);

  // Bank state
  const [banks, setBanks]               = useState<PaystackBank[]>([]);
  const [banksError, setBanksError]     = useState('');
  const [bankSearch, setBankSearch]     = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<PaystackBank | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName]     = useState('');
  const [accountErr, setAccountErr]       = useState('');
  const [lookingUp, setLookingUp]         = useState(false);
  const [saving, setSaving]               = useState(false);
  const [saveError, setSaveError]         = useState('');

  const bankSectionRef = useRef<HTMLDivElement>(null);
  const dropdownRef    = useRef<HTMLDivElement>(null);

  // Load banks on mount
  useEffect(() => {
    getBanks().then(res => {
      if (res.banks) setBanks(res.banks);
      else setBanksError(res.error ?? 'Could not load banks.');
    });
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // Auto-lookup account name when 10 digits entered
  useEffect(() => {
    if (accountNumber.length === 10 && selectedBank) {
      doLookup();
    } else {
      setAccountName('');
      setAccountErr('');
    }
  }, [accountNumber, selectedBank]);

  // Close bank dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Auto-submit OTP when all 6 digits entered
  useEffect(() => {
    if (otp.replace(/\s/g, '').length === 6 && !otpVerified) {
      handleVerifyOtp(otp);
    }
  }, [otp]);

  async function handleVerifyOtp(code: string) {
    setOtpLoading(true);
    setOtpError('');
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'signup' });
    setOtpLoading(false);
    if (error) {
      setOtpError('Invalid code — check your email and try again.');
    } else {
      setOtpVerified(true);
      setTimeout(() => bankSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resending) return;
    setResending(true);
    const supabase = createClient();
    await supabase.auth.resend({ type: 'signup', email });
    setResending(false);
    setCooldown(60);
    setOtp('');
    setOtpError('');
  }

  async function doLookup() {
    if (!selectedBank) return;
    setLookingUp(true);
    setAccountName('');
    setAccountErr('');
    const res = await lookupAccountName(accountNumber, selectedBank.code);
    setLookingUp(false);
    if (res.accountName) {
      setAccountName(res.accountName);
    } else {
      setAccountErr(res.error ?? 'Could not verify account number.');
    }
  }

  async function handleFinish() {
    if (!selectedBank || !accountName) return;
    setSaving(true);
    setSaveError('');
    const res = await saveBankDetails(userId, selectedBank.name, selectedBank.code, accountNumber, accountName);
    setSaving(false);
    if (res.error) {
      setSaveError(res.error);
      return;
    }
    router.push('/dashboard');
  }

  function handleSkip() {
    router.push('/dashboard');
  }

  const filteredBanks = banks.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase()));
  const canFinish = otpVerified && Boolean(accountName) && Boolean(selectedBank);

  return (
    <div style={{ paddingBottom: 40 }}>

      {/* ── SECTION A: Email Verification ─────────────────── */}
      <div style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>Verify your email</h2>
        <p style={sectionSubStyle}>
          We sent a 6-digit code to <strong>{email}</strong>. Enter it below.
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#9A9089', margin: '0 0 20px', lineHeight: 1.5 }}>
          Note: Make sure your Supabase email template includes <code style={{ background: '#f3f3f3', padding: '1px 4px', borderRadius: 4 }}>&#123;&#123; .Token &#125;&#125;</code> to show the 6-digit code.
        </p>

        {otpVerified ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', background: '#EEF8F0', borderRadius: 14 }}>
            <span style={{ color: '#3D9B56', fontSize: 20 }}>✓</span>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 15, color: '#3D9B56' }}>Email verified!</span>
          </div>
        ) : (
          <>
            <OtpInput value={otp} onChange={setOtp} disabled={otpLoading} />
            {otpError && <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#E07070', marginTop: 12 }}>{otpError}</p>}
            {otpLoading && <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#9A9089', marginTop: 12 }}>Verifying...</p>}
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#9A9089', marginTop: 16 }}>
              Didn&apos;t receive it?{' '}
              {cooldown > 0 ? (
                <span>Resend in {cooldown}s</span>
              ) : (
                <button type="button" onClick={handleResend} disabled={resending} style={resendBtnStyle}>
                  {resending ? 'Sending...' : 'Resend code'}
                </button>
              )}
            </p>
          </>
        )}
      </div>

      {/* ── SECTION B: Bank Details ────────────────────────── */}
      <div ref={bankSectionRef} style={{ ...sectionStyle, opacity: otpVerified ? 1 : 0.4, pointerEvents: otpVerified ? 'auto' : 'none', transition: 'opacity 0.3s ease' }}>
        <h2 style={sectionHeadingStyle}>Set up payouts</h2>
        <p style={sectionSubStyle}>Add your Nigerian bank account to receive gifts directly.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Bank selector */}
          <div>
            <label style={labelStyle}>Bank</label>
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <div
                onClick={() => setDropdownOpen(o => !o)}
                style={{ ...fieldInputStyle, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span style={{ color: selectedBank ? '#1C1916' : '#9A9089' }}>
                  {selectedBank ? selectedBank.name : 'Select your bank'}
                </span>
                <ChevronIcon open={dropdownOpen} />
              </div>
              {dropdownOpen && (
                <div style={dropdownStyle}>
                  <input
                    value={bankSearch}
                    onChange={e => setBankSearch(e.target.value)}
                    placeholder="Search banks..."
                    autoFocus
                    style={searchInputStyle}
                    onClick={e => e.stopPropagation()}
                  />
                  <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                    {banksError && <p style={{ padding: '8px 14px', color: '#E07070', fontSize: 13 }}>{banksError}</p>}
                    {filteredBanks.length === 0 && !banksError && (
                      <p style={{ padding: '8px 14px', color: '#9A9089', fontSize: 13 }}>No banks found</p>
                    )}
                    {filteredBanks.map(bank => (
                      <div
                        key={bank.code}
                        onClick={() => { setSelectedBank(bank); setBankSearch(''); setDropdownOpen(false); setAccountNumber(''); setAccountName(''); setAccountErr(''); }}
                        style={{
                          padding: '10px 14px',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-body)',
                          fontSize: 14,
                          color: '#1C1916',
                          background: selectedBank?.code === bank.code ? '#f3f3f3' : 'transparent',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f8f8f8')}
                        onMouseLeave={e => (e.currentTarget.style.background = selectedBank?.code === bank.code ? '#f3f3f3' : 'transparent')}
                      >
                        {bank.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account number */}
          <div>
            <label style={labelStyle}>Account number</label>
            <div style={{ position: 'relative' }}>
              <input
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit account number"
                inputMode="numeric"
                style={fieldInputStyle}
              />
              {lookingUp && (
                <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }}>
                  <Spinner />
                </span>
              )}
            </div>
          </div>

          {/* Account name (auto-filled) */}
          {accountName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#EEF8F0', borderRadius: 14 }}>
              <span style={{ color: '#3D9B56' }}>✓</span>
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: '#3D9B56' }}>{accountName}</span>
            </div>
          )}
          {accountErr && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#E07070', margin: 0 }}>{accountErr}</p>
          )}
        </div>

        {saveError && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#E07070', marginTop: 16 }}>{saveError}</p>
        )}

        <button
          onClick={handleFinish}
          disabled={!canFinish || saving}
          style={{ ...ctaBtnStyle, marginTop: 24, opacity: canFinish && !saving ? 1 : 0.4, cursor: canFinish && !saving ? 'pointer' : 'not-allowed' }}
        >
          {saving ? 'Finishing setup...' : 'Finish setup →'}
        </button>

        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#9A9089', textAlign: 'center', marginTop: 16 }}>
          <button type="button" onClick={handleSkip} disabled={!otpVerified} style={skipBtnStyle}>
            Skip for now — add bank details later in Settings
          </button>
        </p>
      </div>
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9A9089" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease', flexShrink: 0 }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function Spinner() {
  return (
    <span style={{
      width: 14, height: 14,
      border: '2px solid #e0e0e0',
      borderTop: '2px solid #9A9089',
      borderRadius: '50%',
      display: 'inline-block',
      animation: 'k-spin 0.7s linear infinite',
    }} />
  );
}

const sectionStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #f0f0f0',
  borderRadius: 20,
  padding: 24,
  marginBottom: 20,
};

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 800,
  fontSize: 20,
  color: '#1C1916',
  margin: '0 0 6px',
  letterSpacing: '-0.3px',
};

const sectionSubStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  color: '#9A9089',
  margin: '0 0 20px',
  lineHeight: 1.55,
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

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 4px)',
  left: 0,
  right: 0,
  background: '#ffffff',
  border: '1.5px solid #e8e8e8',
  borderRadius: 14,
  boxShadow: '0 8px 24px rgba(28,25,22,0.10)',
  zIndex: 50,
  overflow: 'hidden',
};

const searchInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: 'none',
  borderBottom: '1px solid #f0f0f0',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  color: '#1C1916',
  outline: 'none',
  background: '#fafafa',
  boxSizing: 'border-box',
};

const resendBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  fontWeight: 600,
  color: '#1C1916',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  textDecoration: 'underline',
  padding: 0,
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

const skipBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#9A9089',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  textDecoration: 'underline',
  padding: 0,
};
