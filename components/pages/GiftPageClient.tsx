'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { initializeGift } from '@/lib/actions/gift.actions';
import { formatCurrency } from '@/lib/utils/currency';
import { resolveDisplayName } from '@/lib/utils/display-name';
import DrinkQuantitySelector, { type DrinkQty } from '@/components/shared/DrinkQuantitySelector';
import SocialHandleInput, { PlatformIcon, type SocialPlatformOption } from '@/components/shared/SocialHandleInput';
import SocialLinksRow from '@/components/shared/SocialLinksRow';
import type { GiftTag, Currency, Contribution, SocialLink } from '@/types';

interface Props {
  recipientId: string;
  creatorName: string;
  defaultTag: GiftTag;
  feePercent: number;
  currency: Currency;
  contributions: Contribution[];
  contributorCount: number;
  bio: string | null;
  links: SocialLink[];
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

function activityLine(giftAmount: number, drinkPrice: number, currency: Currency): string {
  if (drinkPrice > 0 && giftAmount % drinkPrice === 0) {
    const qty = giftAmount / drinkPrice;
    return `bought ${qty} drink${qty === 1 ? '' : 's'}`;
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
      style={{
        width: '100%',
        height: '52px',
        background: pending ? 'var(--color-text-muted)' : 'var(--color-accent)',
        color: '#fff',
        border: 'none',
        borderRadius: 'var(--radius-full)',
        fontFamily: 'var(--font-body)',
        fontWeight: 700,
        fontSize: '16px',
        cursor: pending ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s ease',
        boxShadow: pending ? 'none' : 'var(--shadow-btn)',
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
  feePercent,
  currency,
  contributions,
  contributorCount,
  bio,
  links,
}: Props) {
  const [state, formAction] = useFormState(initializeGift, null);
  const [selectedQty, setSelectedQty] = useState<DrinkQty>(1);
  const [nameValue, setNameValue] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [noteValue, setNoteValue] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatformOption>('instagram');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const giftAmount = defaultTag.amount * selectedQty;
  const tagId = defaultTag.id;
  const displayNamePreview = isAnonymous ? 'Anonymous' : (nameValue.trim() || 'Anonymous');

  return (
    <div style={{ width: '100%', paddingBottom: '40px' }}>

      {/* Section 2 — Gift card */}
      <div style={cardStyle}>
        <h2 style={cardHeadingStyle}>Buy {creatorName} a drink 🥤</h2>

        <DrinkQuantitySelector
          drinkPrice={defaultTag.amount}
          currency={currency}
          selectedQty={selectedQty}
          onSelect={setSelectedQty}
        />

        <form action={formAction} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input type="hidden" name="recipient_id" value={recipientId} />
          <input type="hidden" name="tag_id" value={tagId} />
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
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={e => setIsAnonymous(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--color-accent)', cursor: 'pointer', flexShrink: 0, marginTop: '2px' }}
            />
            <div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                Stay anonymous
              </span>
              {isAnonymous || !nameValue.startsWith('@') ? (
                <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  👤 You'll appear as {displayNamePreview}
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px', color: 'var(--color-text-muted)' }}>
                  <PlatformIcon platform={selectedPlatform} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px' }}>|</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {nameValue.replace(/^@/, '')}
                  </span>
                </span>
              )}
            </div>
          </label>

          {/* Note — V2 feature: textarea is UI-only, value is NOT submitted */}
          <div>
            <label style={labelStyle}>
              Leave a note{' '}
              <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              value={noteValue}
              onChange={e => setNoteValue(e.target.value)}
              placeholder="Say something nice…"
              rows={3}
              style={textareaStyle}
            />
          </div>

          <SubmitButton label={`Send ${formatCurrency(giftAmount, currency)} 🥤`} />

          {state && typeof state === 'object' && 'error' in state && state.error && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-danger)', margin: 0, textAlign: 'center' }}>
              {state.error as string}
            </p>
          )}
        </form>
      </div>

      {/* Section 3 — Recent supporters */}
      <div style={{ ...cardStyle, marginTop: '16px' }}>
        <h3 style={sectionHeadingStyle}>
          {contributorCount} supporter{contributorCount !== 1 ? 's' : ''}
        </h3>

        {contributions.length === 0 ? (
          <p style={emptyStyle}>Be the first to support {creatorName}! 🙏</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {contributions.map((c, i) => {
              const name = resolveDisplayName(c.display_name, c.is_anonymous);
              const isLast = i === contributions.length - 1;
              return (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    paddingBottom: isLast ? 0 : '14px',
                    marginBottom: isLast ? 0 : '14px',
                    borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
                  }}
                >
                  <div style={avatarStyle}>
                    {c.is_anonymous || !c.display_name
                      ? '🥤'
                      : getInitials(c.display_name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {name}
                    </p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                      {activityLine(c.gift_amount, defaultTag.amount, currency)}
                    </p>
                  </div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                    {timeAgo(c.created_at)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 4 — About (mobile only; desktop shows in left column) */}
      {bio && (
        <div className="k-gift-about-mobile" style={{ ...cardStyle, marginTop: '16px' }}>
          <h3 style={sectionHeadingStyle}>About {creatorName}</h3>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
            {bio}
          </p>
          {links.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <SocialLinksRow links={links} />
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
          style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}
        >
          Kiima
        </a>
      </p>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--shadow-card)',
  padding: 'var(--space-xl)',
};

const cardHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 500,
  fontSize: '20px',
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-md)',
};

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '16px',
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-md)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '13px',
  color: 'var(--color-text-primary)',
  marginBottom: '8px',
};

const anonRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
  cursor: 'pointer',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  border: '1.5px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-surface)',
  fontFamily: 'var(--font-body)',
  fontSize: '15px',
  color: 'var(--color-text-primary)',
  padding: '12px 14px',
  outline: 'none',
  resize: 'vertical',
  boxSizing: 'border-box',
  lineHeight: 1.5,
};

const avatarStyle: React.CSSProperties = {
  width: '38px',
  height: '38px',
  borderRadius: '50%',
  background: 'var(--color-accent-soft)',
  color: 'var(--color-accent)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '13px',
  flexShrink: 0,
};

const emptyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-muted)',
  margin: 0,
  textAlign: 'center',
  padding: 'var(--space-md) 0',
};

const footerStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  color: 'var(--color-text-muted)',
  textAlign: 'center',
  margin: 'var(--space-xl) 0 0',
};
