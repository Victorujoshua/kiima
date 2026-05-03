'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { initializeGift } from '@/lib/actions/gift.actions';
import { formatCurrency } from '@/lib/utils/currency';
import { resolveDisplayName } from '@/lib/utils/display-name';
import DrinkQuantitySelector, { type DrinkQty } from '@/components/shared/DrinkQuantitySelector';
import SocialHandleInput, { PlatformIcon, type SocialPlatformOption } from '@/components/shared/SocialHandleInput';
import type { GiftTag, Currency, Contribution } from '@/types';

interface Props {
  recipientId: string;
  creatorName: string;
  defaultTag: GiftTag;
  feePercent: number;
  currency: Currency;
  contributions: Contribution[];
  contributorCount: number;
  showContributions: boolean;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function extractEmoji(label: string): string {
  const emojiRegex = /\p{Emoji_Presentation}[\p{Emoji}️‍]*/gu;
  const matches = label.match(emojiRegex);
  return matches ? matches[matches.length - 1] : '🎁';
}

function activityLine(giftAmount: number, drinkPrice: number, currency: Currency, emoji: string): string {
  if (drinkPrice > 0 && giftAmount % drinkPrice === 0) {
    const qty = giftAmount / drinkPrice;
    return `sent ×${qty} ${emoji}`.trim();
  }
  return `sent ${formatCurrency(giftAmount, currency)}`;
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="k-gift-submit"
      style={{
        width: '100%',
        height: '52px',
        background: pending ? '#cccccc' : '#FF5C00',
        color: '#ffffff',
        border: 'none',
        borderRadius: '12px',
        fontFamily: 'var(--kiima-font)',
        fontWeight: 700,
        fontSize: '15px',
        cursor: pending ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s ease, opacity 0.15s ease',
        letterSpacing: '-0.2px',
        boxShadow: pending ? 'none' : '0 4px 14px rgba(255,92,0,0.25)',
      }}
    >
      {pending ? 'Redirecting…' : label}
    </button>
  );
}

export default function GiftPageClient({
  recipientId,
  creatorName,
  defaultTag,
  feePercent: _feePercent,
  currency,
  contributions,
  contributorCount,
  showContributions,
}: Props) {
  const [state, formAction] = useFormState(initializeGift, null);
  const [selectedQty, setSelectedQty] = useState<DrinkQty>(1);
  const [nameValue, setNameValue] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [noteValue, setNoteValue] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatformOption>('instagram');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const giftAmount = defaultTag.amount * selectedQty;
  const tagEmoji = extractEmoji(defaultTag.label);
  const displayNamePreview = isAnonymous ? 'Anonymous' : (nameValue.trim() || 'Anonymous');

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Gift card ── */}
      <div style={cardStyle}>
        <p style={sectionLabelStyle}>Send a gift</p>
        <h2 style={giftHeadingStyle}>{defaultTag.label}</h2>

        <DrinkQuantitySelector
          drinkPrice={defaultTag.amount}
          currency={currency}
          selectedQty={selectedQty}
          onSelect={setSelectedQty}
          emoji={tagEmoji}
        />

        <form
          action={formAction}
          style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}
        >
          <input type="hidden" name="recipient_id" value={recipientId} />
          <input type="hidden" name="tag_id" value={defaultTag.id} />
          <input type="hidden" name="amount" value={giftAmount} />
          <input type="hidden" name="display_name" value={
            nameValue.trim().startsWith('@')
              ? `${selectedPlatform}:${nameValue.trim()}`
              : nameValue.trim()
          } />
          <input type="hidden" name="is_anonymous" value={isAnonymous ? 'true' : 'false'} />

          {/* Name / social handle */}
          <div>
            <label style={labelStyle}>Your name or social</label>
            <SocialHandleInput
              value={nameValue}
              onChange={setNameValue}
              disabled={isAnonymous}
              selectedPlatform={selectedPlatform}
              onPlatformChange={setSelectedPlatform}
              dropdownOpen={dropdownOpen}
              onDropdownToggle={() => setDropdownOpen(o => !o)}
              onDropdownClose={() => setDropdownOpen(false)}
            />
          </div>

          {/* Anonymous toggle */}
          <label style={anonRowStyle}>
            <div style={{ position: 'relative', width: '40px', height: '24px', flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={e => setIsAnonymous(e.target.checked)}
                style={{ position: 'absolute', opacity: 0, inset: 0, margin: 0, cursor: 'pointer', zIndex: 1 }}
              />
              <div style={{
                width: '40px',
                height: '24px',
                borderRadius: '100px',
                background: isAnonymous ? '#D7D744' : 'rgba(0,0,0,0.12)',
                transition: 'background 0.18s ease',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  top: '3px',
                  left: isAnonymous ? '19px' : '3px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: isAnonymous ? '#000000' : '#ffffff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  transition: 'left 0.18s ease',
                }} />
              </div>
            </div>
            <div>
              <span style={anonLabelStyle}>Stay anonymous</span>
              {isAnonymous || !nameValue.startsWith('@') ? (
                <span style={anonSubStyle}>
                  👤 You&apos;ll appear as {displayNamePreview}
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
                  <PlatformIcon platform={selectedPlatform} />
                  <span style={{ fontFamily: 'var(--kiima-font)', fontSize: '12px', color: '#9A9089' }}>·</span>
                  <span style={{ fontFamily: 'var(--kiima-font)', fontSize: '12px', fontWeight: 600, color: '#1C1916' }}>
                    {nameValue.replace(/^@/, '')}
                  </span>
                </span>
              )}
            </div>
          </label>

          {/* Note */}
          <div>
            <label style={labelStyle}>
              Leave a note
              <span style={{ color: '#B5AAAA', fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: '4px' }}>(optional)</span>
            </label>
            <textarea
              name="note"
              value={noteValue}
              onChange={e => setNoteValue(e.target.value)}
              placeholder="Say something nice…"
              rows={3}
              style={{
                width: '100%',
                background: 'var(--color-bg)',
                border: '1.5px solid rgba(0,0,0,0.1)',
                borderRadius: '10px',
                padding: '12px 14px',
                fontFamily: 'var(--kiima-font)',
                fontSize: '14px',
                lineHeight: 1.6,
                color: 'var(--color-text-primary)',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s ease',
              }}
            />
          </div>

          <SubmitButton label={`Send ${formatCurrency(giftAmount, currency)} ${tagEmoji}`} />

          {state && typeof state === 'object' && 'error' in state && state.error && (
            <p style={errorStyle}>{state.error as string}</p>
          )}
        </form>
      </div>

      {/* ── Supporters ── */}
      {showContributions && (
        <div style={cardStyle}>
          <div style={supportersHeaderStyle}>
            <h3 style={supportersLabelStyle}>Supporters</h3>
            {contributorCount > 0 && (
              <span style={countBadgeStyle}>{contributorCount}</span>
            )}
          </div>

          {contributions.length === 0 ? (
            <p style={emptyStyle}>Be the first to support {creatorName}! 🙏</p>
          ) : (
            <div>
              {contributions.map((c, i) => {
                const name = resolveDisplayName(c.display_name, c.is_anonymous);
                const isLast = i === contributions.length - 1;
                const isAnon = c.is_anonymous || !c.display_name;
                return (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 0',
                      borderBottom: isLast ? 'none' : '1px solid rgba(0,0,0,0.05)',
                    }}
                  >
                    <div style={isAnon ? anonAvatarStyle : namedAvatarStyle}>
                      {isAnon ? '?' : getInitials(c.display_name!)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={contributorNameStyle}>{name}</p>
                      <p style={contributorSubStyle}>
                        {activityLine(c.gift_amount, defaultTag.amount, currency, tagEmoji)}
                      </p>
                    </div>
                    <span style={timeAgoStyle}>{timeAgo(c.created_at)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <p style={footerStyle}>
        Powered by{' '}
        <a
          href="https://kiima.app"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#FF5C00', textDecoration: 'none', fontWeight: 700 }}
        >
          kiima
        </a>
      </p>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: '20px',
  border: '1px solid rgba(0,0,0,0.07)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.05)',
  padding: '28px',
};

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontSize: '11px',
  fontWeight: 600,
  color: '#FF5C00',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  margin: '0 0 6px',
};

const giftHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontWeight: 800,
  fontSize: '20px',
  color: '#1C1916',
  margin: '0 0 16px',
  letterSpacing: '-0.4px',
};

const supportersHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '4px',
};

const supportersLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontWeight: 700,
  fontSize: '12px',
  color: '#9A9089',
  margin: 0,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

const countBadgeStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontSize: '11px',
  fontWeight: 700,
  color: '#FF5C00',
  background: 'rgba(255,92,0,0.08)',
  borderRadius: '100px',
  padding: '2px 9px',
  lineHeight: '20px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--kiima-font)',
  fontWeight: 600,
  fontSize: '11px',
  color: '#9A9089',
  marginBottom: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

const anonRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  cursor: 'pointer',
};

const anonLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontSize: '14px',
  color: '#1C1916',
  fontWeight: 600,
  display: 'block',
  marginBottom: '2px',
};

const anonSubStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--kiima-font)',
  fontSize: '12px',
  color: '#9A9089',
};

const namedAvatarStyle: React.CSSProperties = {
  width: '34px',
  height: '34px',
  borderRadius: '50%',
  background: '#D7D744',
  color: '#000000',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--kiima-font)',
  fontWeight: 800,
  fontSize: '11px',
  flexShrink: 0,
};

const anonAvatarStyle: React.CSSProperties = {
  width: '34px',
  height: '34px',
  borderRadius: '50%',
  background: 'rgba(0,0,0,0.07)',
  color: '#9A9089',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--kiima-font)',
  fontWeight: 700,
  fontSize: '13px',
  flexShrink: 0,
};

const contributorNameStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontWeight: 600,
  fontSize: '14px',
  color: '#1C1916',
  margin: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const contributorSubStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontSize: '12px',
  color: '#9A9089',
  margin: '2px 0 0',
};

const timeAgoStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontSize: '11px',
  fontWeight: 500,
  color: '#B5AAAA',
  flexShrink: 0,
};

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontSize: '13px',
  color: 'var(--color-danger)',
  margin: 0,
  textAlign: 'center',
};

const emptyStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontSize: '14px',
  color: '#B5AAAA',
  margin: '12px 0 0',
  textAlign: 'center',
  padding: '8px 0',
};

const footerStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontSize: '12px',
  color: '#B5AAAA',
  textAlign: 'center',
  margin: '4px 0 0',
};
