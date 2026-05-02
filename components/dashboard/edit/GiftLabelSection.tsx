'use client';

import { useState } from 'react';
import { updateDefaultTag } from '@/lib/actions/tag.actions';
import type { Currency } from '@/types';

const SYMBOLS: Record<Currency, string> = { NGN: '₦', USD: '$', GBP: '£', EUR: '€' };

interface Props {
  userId: string;
  currency: Currency;
  initialLabel: string;  // full label e.g. "Buy me a drink 🥤"
  initialAmount: number;
  onChange: (label: string, amount: number) => void;
}

type Status = 'idle' | 'saving' | 'saved' | 'error';

const EMOJIS = ['🥤', '🍺', '🍕', '📚', '🎮', '🎵', '🎨', '☕', '🍜', '🏋️', '✈️', '💡'];

const QUICK_PICKS = [
  { emoji: '🥤', text: 'drink' },
  { emoji: '🍺', text: 'beer'  },
  { emoji: '🍕', text: 'pizza' },
  { emoji: '📚', text: 'book'  },
  { emoji: '🎮', text: 'game'  },
];

function parseLabel(label: string): { emoji: string; text: string } {
  // Label format: "Buy me a [text] [emoji]"
  // Split on spaces, last token is likely the emoji
  const parts = label.trim().split(' ');
  const lastPart = parts[parts.length - 1] ?? '';
  // Check if the last part contains a non-ASCII character (emoji)
  const isEmoji = lastPart.length > 0 && lastPart.charCodeAt(0) > 127;
  const emoji = isEmoji ? lastPart : '🥤';
  // Extract text between "Buy me a " and the emoji
  const withoutEmoji = isEmoji ? label.slice(0, label.lastIndexOf(lastPart)).trim() : label;
  const withoutPrefix = withoutEmoji.replace(/buy me a?\s*/i, '').trim();
  return { emoji, text: withoutPrefix || 'drink' };
}

export default function GiftLabelSection({ userId, currency, initialLabel, initialAmount, onChange }: Props) {
  const parsed = parseLabel(initialLabel);
  const [emoji, setEmoji]       = useState(parsed.emoji);
  const [text, setText]         = useState(parsed.text);
  const [amount, setAmount]     = useState(String(initialAmount));
  const [showEmojis, setShowEmojis] = useState(false);
  const [status, setStatus]     = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const symbol = SYMBOLS[currency] ?? '₦';
  const fullLabel = `Buy me a ${text.trim()} ${emoji}`.trim();

  function selectQuickPick(q: { emoji: string; text: string }) {
    setEmoji(q.emoji);
    setText(q.text);
    onChange(`Buy me a ${q.text} ${q.emoji}`, Number(amount) || initialAmount);
  }

  async function handleSave() {
    const amt = Number(amount);
    if (!text.trim() || isNaN(amt) || amt <= 0) return;
    setStatus('saving');
    setErrorMsg('');

    const result = await updateDefaultTag(userId, fullLabel, amt);
    if (result.error) {
      setStatus('error');
      setErrorMsg(result.error);
    } else {
      setStatus('saved');
      onChange(fullLabel, amt);
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

  return (
    <div style={cardStyle}>
      <p style={titleStyle}>Gift tag label</p>
      <p style={subtitleStyle}>Personalise what supporters are &ldquo;buying&rdquo; you</p>

      {/* Row 1 — emoji + text input */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 14 }}>
        {/* Emoji picker button */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button type="button" onClick={() => setShowEmojis(v => !v)} style={emojiBtnStyle}>
            <span style={{ fontSize: 22 }}>{emoji}</span>
          </button>
          {showEmojis && (
            <div style={emojiGridStyle}>
              {EMOJIS.map(e => (
                <button
                  key={e}
                  type="button"
                  onMouseDown={() => { setEmoji(e); setShowEmojis(false); onChange(`Buy me a ${text} ${e}`, Number(amount) || initialAmount); }}
                  style={emojiOptionStyle}
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text input */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={prefixStyle}>Buy me a</span>
            <input
              type="text"
              value={text}
              maxLength={20}
              placeholder="drink, coffee, book…"
              onChange={e => { setText(e.target.value); onChange(`Buy me a ${e.target.value} ${emoji}`, Number(amount) || initialAmount); }}
              style={textInputStyle}
            />
          </div>
          <p style={previewTextStyle}>Preview: &ldquo;{fullLabel}&rdquo;</p>
        </div>
      </div>

      {/* Row 2 — quick pick pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {QUICK_PICKS.map(q => (
          <button
            key={q.text}
            type="button"
            onClick={() => selectQuickPick(q)}
            style={quickPillStyle(emoji === q.emoji && text === q.text)}
          >
            {q.emoji} {q.text}
          </button>
        ))}
      </div>

      {/* Row 3 — amount */}
      <div style={{ marginBottom: 4 }}>
        <label style={amountLabelStyle}>Amount per item</label>
        <div style={amountRowStyle}>
          <span style={currencySymbolStyle}>{symbol}</span>
          <input
            type="number"
            value={amount}
            min={1}
            placeholder="2000"
            onChange={e => { setAmount(e.target.value); onChange(fullLabel, Number(e.target.value)); }}
            style={amountInputStyle}
          />
        </div>
        <p style={helperStyle}>This sets the base price for 1 item</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 16, gap: 12 }}>
        {status === 'saved' && <span style={successStyle}>Saved ✓</span>}
        {status === 'error'  && <span style={errorStyle}>{errorMsg}</span>}
        <button
          type="button"
          onClick={handleSave}
          disabled={status === 'saving' || !text.trim() || !Number(amount)}
          style={saveBtnStyle(status === 'saving' || !text.trim() || !Number(amount))}
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
  margin: '0 0 4px',
};

const subtitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: '#9A9089',
  margin: '0 0 20px',
};

const emojiBtnStyle: React.CSSProperties = {
  width: 48,
  height: 48,
  background: '#F9F9F9',
  border: '1.5px solid #EBEBEB',
  borderRadius: 10,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const emojiGridStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  left: 0,
  background: '#ffffff',
  border: '1px solid #EBEBEB',
  borderRadius: 12,
  padding: 10,
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  zIndex: 50,
  display: 'grid',
  gridTemplateColumns: 'repeat(6, 1fr)',
  gap: 4,
};

const emojiOptionStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  background: 'none',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 20,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const prefixStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 15,
  color: '#9A9089',
  flexShrink: 0,
};

const textInputStyle: React.CSSProperties = {
  flex: 1,
  height: 44,
  border: '1.5px solid #EBEBEB',
  borderRadius: 10,
  padding: '0 12px',
  fontFamily: 'var(--font-body)',
  fontSize: 15,
  color: '#1C1916',
  outline: 'none',
  minWidth: 0,
};

const previewTextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 12,
  color: '#B5AAAA',
  margin: '6px 0 0',
};

function quickPillStyle(active: boolean): React.CSSProperties {
  return {
    fontFamily: 'var(--font-body)',
    fontWeight: active ? 700 : 500,
    fontSize: 13,
    color: active ? '#000000' : '#5A4D44',
    background: active ? '#D7D744' : '#F4F4F4',
    border: 'none',
    borderRadius: 100,
    padding: '7px 14px',
    cursor: 'pointer',
  };
}

const amountLabelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#B5AAAA',
  marginBottom: 8,
};

const amountRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  border: '1.5px solid #EBEBEB',
  borderRadius: 10,
  overflow: 'hidden',
  height: 48,
};

const currencySymbolStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 15,
  color: '#1C1916',
  background: '#F9F9F9',
  padding: '0 12px',
  borderRight: '1.5px solid #EBEBEB',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
};

const amountInputStyle: React.CSSProperties = {
  flex: 1,
  height: '100%',
  border: 'none',
  padding: '0 14px',
  fontFamily: 'var(--font-body)',
  fontSize: 15,
  color: '#1C1916',
  outline: 'none',
  background: '#ffffff',
};

const helperStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 12,
  color: '#B5AAAA',
  margin: '6px 0 0',
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
