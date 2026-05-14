'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils/currency';
import { requestWithdrawal } from '@/lib/actions/withdrawal.actions';
import type { Currency } from '@/types';

interface Props {
  isOpen:        boolean;
  onClose:       () => void;
  bankName:      string | null;
  accountNumber: string | null;
  currency:      Currency;
  balance:       number;
}

export default function WithdrawModal({ isOpen, onClose, bankName, accountNumber, currency, balance }: Props) {
  const router = useRouter();
  const [amount, setAmount]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);

  // Reset state each time modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const hasBankAccount = !!(bankName && accountNumber);
  const masked         = accountNumber ? `****${accountNumber.slice(-4)}` : '';
  const numericAmount  = Number(amount);
  const canSubmit      = numericAmount > 0 && numericAmount <= balance && !submitting;

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  async function handleWithdraw() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    const result = await requestWithdrawal(numericAmount);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      router.refresh();
    }
  }

  return (
    <div style={backdropStyle} onClick={handleBackdropClick}>
      <div style={modalStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <span style={titleStyle}>Withdraw earnings</span>
          <button type="button" onClick={onClose} style={closeBtnStyle} aria-label="Close">✕</button>
        </div>

        {/* ── Success state ── */}
        {success ? (
          <div style={successStateStyle}>
            <div style={successIconStyle}>✓</div>
            <p style={successHeadingStyle}>Withdrawal requested</p>
            <p style={successBodyStyle}>
              We&apos;ll process your withdrawal of {formatCurrency(numericAmount, currency)} within 24 hours.
              Funds will be sent to {bankName} {masked}.
            </p>
            <button type="button" onClick={onClose} style={doneBtnStyle}>
              Done
            </button>
          </div>
        ) : !hasBankAccount ? (
          /* ── No bank account state ── */
          <div style={noBankStateStyle}>
            <span style={bankEmojiStyle}>🏦</span>
            <p style={noBankHeadingStyle}>Add a bank account first</p>
            <p style={noBankBodyStyle}>
              You need a saved bank account before you can withdraw your earnings.
            </p>
            <button
              type="button"
              onClick={() => { onClose(); router.push('/dashboard/settings'); }}
              style={goSettingsBtnStyle}
            >
              Go to Settings →
            </button>
          </div>
        ) : (
          /* ── Withdrawal form ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Available balance */}
            <div style={balanceRowStyle}>
              <span style={balanceLabelStyle}>Available</span>
              <span style={balanceAmountStyle}>{formatCurrency(balance, currency)}</span>
            </div>

            {/* Amount input */}
            <div>
              <label style={fieldLabelStyle}>Amount to withdraw</label>
              <div style={{ position: 'relative' }}>
                <span style={currencyPrefixStyle}>
                  {currency === 'NGN' ? '₦' : currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€'}
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={amount}
                  onChange={e => { setAmount(e.target.value); setError(null); }}
                  min={1}
                  max={balance}
                  style={amountInputStyle}
                />
              </div>
              {numericAmount > balance && (
                <p style={fieldErrorStyle}>Amount exceeds available balance.</p>
              )}
            </div>

            {/* Paying to */}
            <div style={payingToCardStyle}>
              <span style={payingToLabelStyle}>Paying to</span>
              <span style={payingToValueStyle}>{bankName} {masked}</span>
            </div>

            <p style={settingsHintStyle}>
              To change your bank account, go to{' '}
              <button
                type="button"
                onClick={() => { onClose(); router.push('/dashboard/settings'); }}
                style={inlineLinkStyle}
              >
                Settings
              </button>.
            </p>

            {error && <p style={errorStyle}>{error}</p>}

            <button
              type="button"
              onClick={handleWithdraw}
              disabled={!canSubmit}
              style={withdrawBtnStyle(!canSubmit)}
            >
              {submitting ? 'Processing…' : `Withdraw ${amount ? formatCurrency(numericAmount, currency) : ''}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const backdropStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(28, 25, 22, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '20px',
};

const modalStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: 20,
  padding: 28,
  width: '100%',
  maxWidth: 420,
  boxShadow: '0 24px 64px rgba(28, 25, 22, 0.18)',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 24,
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 16,
  color: '#1C1916',
};

const closeBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 16,
  color: '#9A9089',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px 8px',
  lineHeight: 1,
};

const successStateStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: '8px 0 4px',
  gap: 8,
};

const successIconStyle: React.CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: '50%',
  background: '#EEF8F0',
  border: '1px solid #B8E4C4',
  color: '#3D9B56',
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 22,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 4,
};

const successHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 16,
  color: '#1C1916',
  margin: 0,
};

const successBodyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#9A9089',
  lineHeight: 1.55,
  margin: '4px 0 12px',
  maxWidth: 300,
};

const doneBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 14,
  color: '#ffffff',
  background: '#1C1916',
  border: 'none',
  borderRadius: 100,
  padding: '12px 32px',
  cursor: 'pointer',
};

const noBankStateStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: '12px 0',
  gap: 8,
};

const bankEmojiStyle: React.CSSProperties = {
  fontSize: 36,
  marginBottom: 4,
};

const noBankHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 16,
  color: '#1C1916',
  margin: 0,
};

const noBankBodyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#9A9089',
  lineHeight: 1.55,
  margin: '4px 0 12px',
  maxWidth: 280,
};

const goSettingsBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 14,
  color: '#ffffff',
  background: '#1C1916',
  border: 'none',
  borderRadius: 100,
  padding: '12px 24px',
  cursor: 'pointer',
  marginTop: 4,
};

const balanceRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: '#F9F9F7',
  borderRadius: 12,
  padding: '12px 16px',
};

const balanceLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: '#9A9089',
};

const balanceAmountStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 600,
  fontSize: 20,
  color: '#1C1916',
};

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

const currencyPrefixStyle: React.CSSProperties = {
  position: 'absolute',
  left: 14,
  top: '50%',
  transform: 'translateY(-50%)',
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 16,
  color: '#1C1916',
  pointerEvents: 'none',
};

const amountInputStyle: React.CSSProperties = {
  width: '100%',
  height: 52,
  border: '1.5px solid #EBEBEB',
  borderRadius: 12,
  background: '#ffffff',
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 20,
  color: '#1C1916',
  paddingLeft: 32,
  paddingRight: 14,
  outline: 'none',
  boxSizing: 'border-box',
};

const payingToCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: '#F9F9F7',
  borderRadius: 12,
  padding: '12px 16px',
};

const payingToLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: '#9A9089',
};

const payingToValueStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: 14,
  color: '#1C1916',
};

const settingsHintStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 12,
  color: '#9A9089',
  margin: 0,
};

const inlineLinkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 12,
  fontWeight: 600,
  color: '#1C1916',
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  textDecoration: 'underline',
};

const fieldErrorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 12,
  color: 'var(--color-danger)',
  margin: '4px 0 0',
};

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: 'var(--color-danger)',
  background: 'var(--color-danger-soft)',
  borderRadius: 10,
  padding: '10px 14px',
  margin: 0,
};

function withdrawBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    width: '100%',
    height: 50,
    background: disabled ? '#E0DBDB' : '#1C1916',
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
