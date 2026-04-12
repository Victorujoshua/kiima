import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils/currency';
import type { Currency } from '@/types';

interface Props {
  searchParams: { reference?: string };
}

export default async function GiftSuccessPage({ searchParams }: Props) {
  const reference = searchParams.reference ?? null;

  // No reference in URL — Paystack didn't redirect properly
  if (!reference) {
    return <PendingCard creatorUsername={null} />;
  }

  const supabase = createClient();

  // Contributions are publicly readable per RLS
  const { data } = await supabase
    .from('contributions')
    .select('amount, currency, recipient:profiles!recipient_id(display_name, username)')
    .eq('paystack_ref', reference)
    .single();

  // Not found — webhook might still be processing
  if (!data) {
    return <PendingCard creatorUsername={null} />;
  }

  const recipient = Array.isArray(data.recipient) ? data.recipient[0] : data.recipient;
  const displayName  = (recipient as { display_name: string; username: string } | null)?.display_name ?? null;
  const username     = (recipient as { display_name: string; username: string } | null)?.username ?? null;
  const amount       = Number(data.amount);
  const currency     = (data.currency ?? 'NGN') as Currency;

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <p style={emojiStyle}>🙏</p>

        <h1 style={headingStyle}>Your gift was sent! Thank you</h1>

        <p style={bodyStyle}>
          {displayName
            ? `${displayName} will love this.`
            : 'The creator will love this.'}
        </p>

        {/* Amount pill */}
        <div style={amountPillStyle}>
          <span style={amountLabelStyle}>YOU SENT</span>
          <span style={amountValueStyle}>{formatCurrency(amount, currency)}</span>
        </div>

        {/* Back link */}
        {username && (
          <Link href={`/${username}`} style={backLinkStyle}>
            ← Back to {displayName ?? username}&apos;s page
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Pending / not-found state ────────────────────────────────────────────────

function PendingCard({ creatorUsername }: { creatorUsername: string | null }) {
  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <p style={emojiStyle}>⏳</p>
        <h1 style={headingStyle}>We&apos;re confirming your payment</h1>
        <p style={bodyStyle}>
          Check back shortly — it usually takes just a moment.
        </p>
        {creatorUsername ? (
          <Link href={`/${creatorUsername}`} style={backLinkStyle}>
            ← Go back
          </Link>
        ) : (
          <Link href="/" style={backLinkStyle}>
            ← Go home
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px',
};

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--shadow-card)',
  padding: 'var(--space-2xl)',
  maxWidth: '440px',
  width: '100%',
  textAlign: 'center',
};

const emojiStyle: React.CSSProperties = {
  fontSize: '48px',
  margin: '0 0 var(--space-md)',
  lineHeight: 1,
};

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 500,
  fontSize: '26px',
  color: 'var(--color-text-primary)',
  margin: '0 0 var(--space-sm)',
  lineHeight: 1.25,
};

const bodyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 400,
  fontSize: '14px',
  lineHeight: 1.65,
  color: 'var(--color-text-secondary)',
  margin: '0 0 var(--space-xl)',
};

const amountPillStyle: React.CSSProperties = {
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2px',
  background: 'var(--color-success-soft)',
  borderRadius: 'var(--radius-full)',
  padding: '10px 24px',
  marginBottom: 'var(--space-xl)',
};

const amountLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '10px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--color-success)',
};

const amountValueStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '22px',
  color: 'var(--color-success)',
};

const backLinkStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontWeight: 500,
  fontSize: '14px',
  color: 'var(--color-accent)',
  textDecoration: 'none',
};
