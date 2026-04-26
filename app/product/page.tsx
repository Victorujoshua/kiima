import MarketingHeader from '@/components/layout/MarketingHeader';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product — Kiima',
  description: 'Everything Kiima offers: gift links, support pools, gift tags, and a creator dashboard.',
};

const features = [
  {
    emoji: '🔗',
    title: 'Your personal gift link',
    body: 'Every creator gets a beautiful public page at kiima.app/yourname. Share it in your bio, messages, or anywhere your audience finds you. No setup, no waiting — your page is live the moment you sign up.',
  },
  {
    emoji: '🥤',
    title: 'Gift Tags',
    body: 'Create preset gift options that make giving effortless. Your default "Buy me a drink 🥤" tag is ready from day one. Add custom tags — "Fuel my content ⛽", "Back my project 🚀" — with any amount you choose.',
  },
  {
    emoji: '🎯',
    title: 'Support Pools',
    body: 'Set a funding goal and let your community contribute together. Perfect for equipment, events, travel, emergencies, or any project that needs collective support. Pools have a progress bar, contributor feed, and a shareable link.',
  },
  {
    emoji: '📊',
    title: 'Creator Dashboard',
    body: 'See everything at a glance — total gifts received, pool contributions, transaction history, and your active pools. Manage your gift tags, social links, and profile all in one place.',
  },
  {
    emoji: '💸',
    title: 'Transparent fees',
    body: 'Kiima charges a flat 3% platform fee, deducted from gifts at settlement. Paystack\'s processing fee (1.5% + ₦100, capped at ₦2,000) is shown to the gifter before they pay — no hidden surprises for anyone.',
  },
  {
    emoji: '👤',
    title: 'Anonymous gifting',
    body: 'Gifters can choose to stay anonymous. When they do, they appear as "Anonymous" everywhere — including to the creator and to Kiima admins. Anonymity is absolute and enforced at the database level.',
  },
  {
    emoji: '🌐',
    title: 'Social links',
    body: 'Add links to your Instagram, TikTok, Twitter, YouTube, LinkedIn, or personal website. They appear as icon buttons on your public gift page so supporters can find you everywhere.',
  },
  {
    emoji: '🌙',
    title: 'Dark mode',
    body: 'Kiima supports light and dark mode across the dashboard and public pages. Your preference is saved automatically and persists across sessions.',
  },
];

export default function ProductPage() {
  return (
    <main style={pageStyle}>
      <MarketingHeader />

      <div style={wrapStyle}>
        {/* Hero */}
        <div style={heroStyle}>
          <p style={eyebrowStyle}>Product</p>
          <h1 style={titleStyle}>Everything you need to receive support from your community</h1>
          <p style={introStyle}>
            Kiima is built around one idea: giving should feel natural. Here&apos;s what the platform includes.
          </p>
          <Link href="/signup" style={ctaStyle}>Get started free →</Link>
        </div>

        {/* Feature grid */}
        <div style={gridStyle}>
          {features.map((f) => (
            <div key={f.title} style={cardStyle}>
              <span style={emojiStyle}>{f.emoji}</span>
              <h2 style={cardTitleStyle}>{f.title}</h2>
              <p style={cardBodyStyle}>{f.body}</p>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div style={footerCtaStyle}>
          <h2 style={footerHeadingStyle}>Ready to start?</h2>
          <p style={footerSubStyle}>Your gift page is live in under a minute. No credit card required.</p>
          <Link href="/signup" style={ctaStyle}>Create your Kiima →</Link>
        </div>
      </div>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg)',
  paddingTop: '68px',
  paddingBottom: '80px',
};

const wrapStyle: React.CSSProperties = {
  maxWidth: '900px',
  margin: '0 auto',
  padding: '48px 24px 0',
};

const heroStyle: React.CSSProperties = {
  marginBottom: '56px',
  maxWidth: '640px',
};

const eyebrowStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '11px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  color: 'var(--color-text-faint)',
  margin: '0 0 12px',
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 800,
  fontSize: 'clamp(28px, 4vw, 44px)',
  color: 'var(--color-text-primary)',
  letterSpacing: '-1.5px',
  lineHeight: 1.1,
  margin: '0 0 16px',
};

const introStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '16px',
  color: 'var(--color-text-secondary)',
  lineHeight: 1.7,
  margin: '0 0 28px',
};

const ctaStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '15px',
  color: '#000000',
  background: '#D7D744',
  padding: '13px 24px',
  textDecoration: 'none',
  border: '2px solid #000000',
  boxShadow: '4px 4px 0 0 #000000',
  transition: 'box-shadow 0.15s ease, transform 0.15s ease',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '16px',
  marginBottom: '64px',
};

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '2px solid #000000',
  boxShadow: 'var(--shadow-card)',
  padding: '24px',
};

const emojiStyle: React.CSSProperties = {
  fontSize: '28px',
  display: 'block',
  marginBottom: '12px',
  lineHeight: 1,
};

const cardTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '16px',
  color: 'var(--color-text-primary)',
  margin: '0 0 8px',
  letterSpacing: '-0.3px',
};

const cardBodyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-secondary)',
  lineHeight: 1.65,
  margin: 0,
};

const footerCtaStyle: React.CSSProperties = {
  borderTop: '2px solid #000000',
  paddingTop: '48px',
  textAlign: 'center' as const,
};

const footerHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 800,
  fontSize: 'clamp(24px, 3vw, 36px)',
  color: 'var(--color-text-primary)',
  letterSpacing: '-1px',
  margin: '0 0 12px',
};

const footerSubStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '15px',
  color: 'var(--color-text-muted)',
  margin: '0 0 28px',
};
