import MarketingHeader from '@/components/layout/MarketingHeader';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'For Creators — Kiima',
  description: 'Kiima is built for creators who want to receive support from their community — simply, beautifully, and without the hassle.',
};

const steps = [
  { n: '01', title: 'Sign up in seconds', body: 'Create your account, pick your username, and your gift page is live at kiima.app/yourname. No approval process, no waiting list.' },
  { n: '02', title: 'Customise your page', body: 'Add a photo, write a bio, set your gift tags, and link your social profiles. Your page reflects your brand, not ours.' },
  { n: '03', title: 'Share your link', body: 'Drop your Kiima link in your Instagram bio, TikTok description, YouTube about section, Twitter/X profile, or send it directly to your community.' },
  { n: '04', title: 'Receive gifts', body: 'Supporters visit your page, pick a gift tag or enter a custom amount, and pay via Paystack. Funds settle directly to your bank account.' },
];

const useCases = [
  { emoji: '🎨', label: 'Artists & illustrators' },
  { emoji: '🎵', label: 'Musicians & producers' },
  { emoji: '📹', label: 'YouTubers & streamers' },
  { emoji: '✍️', label: 'Writers & bloggers' },
  { emoji: '📸', label: 'Photographers' },
  { emoji: '💻', label: 'Developers & designers' },
  { emoji: '🎤', label: 'Podcasters' },
  { emoji: '🍳', label: 'Chefs & food creators' },
  { emoji: '💪', label: 'Fitness coaches' },
  { emoji: '📚', label: 'Educators & tutors' },
  { emoji: '🎮', label: 'Gamers & esports' },
  { emoji: '🌍', label: 'Community builders' },
];

const faqs = [
  { q: 'Is Kiima free to use?', a: 'Yes. There are no monthly fees or setup costs. Kiima only takes a 3% platform fee when a gift is successfully received — so we only earn when you do.' },
  { q: 'How do I receive my money?', a: 'Funds settle directly to your Nigerian bank account via Paystack. Kiima does not hold your money — it goes straight to you at settlement.' },
  { q: 'Can I set my own gift amounts?', a: 'Yes. You can create unlimited custom Gift Tags with any label and amount you choose, in addition to the default "Buy me a drink 🥤" tag.' },
  { q: 'What currencies does Kiima support?', a: 'Kiima supports NGN, USD, GBP, and EUR. You select your currency on sign-up and all transactions use that currency.' },
  { q: 'Can I run a fundraising campaign?', a: 'Yes — that\'s what Support Pools are for. Create a pool with a goal amount, share the link, and your community can contribute toward it together.' },
];

export default function CreatorsPage() {
  return (
    <main style={pageStyle}>
      <MarketingHeader />

      <div style={wrapStyle}>

        {/* Hero */}
        <div style={heroStyle}>
          <p style={eyebrowStyle}>For Creators</p>
          <h1 style={titleStyle}>Your community wants to support you. Make it easy.</h1>
          <p style={introStyle}>
            Kiima gives you a beautiful gift page, support pools, and a dashboard — so your audience can back you in the simplest way possible.
          </p>
          <Link href="/signup" style={ctaStyle}>Create your page free →</Link>
        </div>

        {/* How it works */}
        <section style={sectionStyle}>
          <p style={sectionEyebrow}>How it works</p>
          <div style={stepsGrid}>
            {steps.map((s) => (
              <div key={s.n} style={stepCard}>
                <span style={stepNumber}>{s.n}</span>
                <h3 style={stepTitle}>{s.title}</h3>
                <p style={stepBody}>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Who it's for */}
        <section style={sectionStyle}>
          <p style={sectionEyebrow}>Who it&apos;s for</p>
          <h2 style={sectionHeading}>Built for every kind of creator</h2>
          <div style={useCaseGrid}>
            {useCases.map((u) => (
              <div key={u.label} style={useCaseChip}>
                <span style={{ fontSize: '18px' }}>{u.emoji}</span>
                <span style={chipLabel}>{u.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={sectionStyle}>
          <p style={sectionEyebrow}>FAQ</p>
          <h2 style={sectionHeading}>Common questions</h2>
          <div style={faqList}>
            {faqs.map((f) => (
              <div key={f.q} style={faqItem}>
                <h3 style={faqQ}>{f.q}</h3>
                <p style={faqA}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div style={footerCtaStyle}>
          <h2 style={footerHeadingStyle}>Start receiving support today</h2>
          <p style={footerSubStyle}>Free to set up. No credit card needed.</p>
          <Link href="/signup" style={ctaStyle}>Get started →</Link>
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
  maxWidth: '860px',
  margin: '0 auto',
  padding: '48px 24px 0',
};

const heroStyle: React.CSSProperties = {
  marginBottom: '64px',
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
};

const sectionStyle: React.CSSProperties = {
  marginBottom: '64px',
};

const sectionEyebrow: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '11px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  color: 'var(--color-accent)',
  margin: '0 0 10px',
};

const sectionHeading: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 800,
  fontSize: 'clamp(22px, 3vw, 32px)',
  color: 'var(--color-text-primary)',
  letterSpacing: '-1px',
  margin: '0 0 28px',
};

const stepsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '16px',
};

const stepCard: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '2px solid #000000',
  boxShadow: 'var(--shadow-card)',
  padding: '20px',
};

const stepNumber: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontWeight: 800,
  fontSize: '13px',
  color: 'var(--color-accent)',
  letterSpacing: '0.05em',
  marginBottom: '10px',
};

const stepTitle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '15px',
  color: 'var(--color-text-primary)',
  margin: '0 0 8px',
};

const stepBody: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-secondary)',
  lineHeight: 1.65,
  margin: 0,
};

const useCaseGrid: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: '10px',
};

const useCaseChip: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: 'var(--color-surface)',
  border: '2px solid #000000',
  boxShadow: '2px 2px 0 0 #000000',
  padding: '8px 14px',
};

const chipLabel: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '13px',
  color: 'var(--color-text-primary)',
};

const faqList: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0',
};

const faqItem: React.CSSProperties = {
  borderBottom: '1px solid var(--color-border)',
  padding: '20px 0',
};

const faqQ: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '15px',
  color: 'var(--color-text-primary)',
  margin: '0 0 8px',
};

const faqA: React.CSSProperties = {
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
  fontSize: 'clamp(22px, 3vw, 36px)',
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
