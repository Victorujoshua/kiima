import MarketingHeader from '@/components/layout/MarketingHeader';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Kiima',
  description: 'How Kiima collects, uses, and protects your personal information.',
};

const LAST_UPDATED = 'April 26, 2026';

const sections = [
  {
    title: '1. Who we are',
    body: `Kiima ("we", "us", "our") is a social gifting and support pool platform that lets creators receive monetary gifts through a personalised link. Our platform is available at kiima.app.

If you have questions about this policy, contact us at hello@kiima.app.`,
  },
  {
    title: '2. Information we collect',
    body: `When you create a Kiima account we collect:
• Your email address and password (via Supabase Auth)
• Your display name, username, bio, and profile avatar
• Your selected currency
• Social media links you choose to add

When a gifter sends a gift we collect:
• The display name or social handle the gifter provides (or "Anonymous" if they choose)
• The gift amount
• Payment reference from Paystack (we do not store card numbers or bank details)

We also collect standard server logs (IP address, browser type, pages visited) for security and debugging purposes.`,
  },
  {
    title: '3. How we use your information',
    body: `We use the information we collect to:
• Operate and improve the Kiima platform
• Display your public creator profile to gifters
• Process gifts and calculate fees via Paystack
• Send transactional emails (e.g. password reset)
• Detect and prevent fraud or abuse
• Comply with legal obligations

We do not sell your personal information to third parties.`,
  },
  {
    title: '4. Payments and Paystack',
    body: `All payment processing is handled by Paystack (paystack.com). When a gifter completes a payment:
• Card and bank details are entered directly on Paystack's secure checkout — Kiima never sees or stores them
• Paystack sends us a webhook confirming the transaction was successful
• We record the gift amount, platform fees, and Paystack's transaction reference

Paystack's own privacy policy governs how they handle payment data. You can read it at paystack.com/privacy.`,
  },
  {
    title: '5. Anonymous contributions',
    body: `Gifters may choose to contribute anonymously. When a gifter selects "Stay anonymous":
• Their display name is stored as NULL in our database
• They appear publicly as "Anonymous"
• This anonymity is absolute — even Kiima administrators cannot reveal the identity of an anonymous gifter`,
  },
  {
    title: '6. Data sharing',
    body: `We share your data only with:
• Supabase — database, authentication, and file storage (supabase.com)
• Paystack — payment processing (paystack.com)
• Vercel — hosting and edge delivery (vercel.com)
• Resend — transactional email delivery (resend.com)

Each of these providers is bound by their own privacy policies and data processing agreements. We do not share your data with advertisers, data brokers, or any other third parties.`,
  },
  {
    title: '7. Cookies and tracking',
    body: `Kiima uses session cookies strictly necessary for authentication. We do not use advertising cookies, cross-site tracking, or analytics that identify individual users. Standard server access logs are retained for up to 90 days for security purposes.`,
  },
  {
    title: '8. Data retention',
    body: `We retain your account data for as long as your account is active. If you wish to delete your account, contact us at hello@kiima.app and we will remove your profile and personal data within 30 days, except where retention is required by law (e.g. financial records).

Contribution records may be retained for accounting and compliance purposes even after account deletion.`,
  },
  {
    title: '9. Your rights',
    body: `Depending on your location, you may have the right to:
• Access the personal data we hold about you
• Correct inaccurate data
• Request deletion of your data
• Object to or restrict processing of your data
• Receive a copy of your data in a portable format

To exercise any of these rights, contact us at hello@kiima.app.`,
  },
  {
    title: '10. Security',
    body: `We use industry-standard measures to protect your data, including encrypted connections (HTTPS), row-level security on our database, and restricted access to production systems. No method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: '11. Children',
    body: `Kiima is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, contact us at hello@kiima.app and we will delete it promptly.`,
  },
  {
    title: '12. Changes to this policy',
    body: `We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page. Continued use of Kiima after changes are posted constitutes your acceptance of the updated policy.`,
  },
];

export default function PrivacyPage() {
  return (
    <main style={pageStyle}>
      <MarketingHeader />

      <div style={wrapStyle}>
        {/* Header */}
        <div style={heroStyle}>
          <p style={eyebrowStyle}>Legal</p>
          <h1 style={titleStyle}>Privacy Policy</h1>
          <p style={metaStyle}>Last updated: {LAST_UPDATED}</p>
          <p style={introStyle}>
            This Privacy Policy explains how Kiima collects, uses, and protects information about you when you use our platform — whether as a creator or a gifter.
          </p>
        </div>

        {/* Sections */}
        <div style={sectionsStyle}>
          {sections.map((s) => (
            <div key={s.title} style={sectionStyle}>
              <h2 style={sectionTitleStyle}>{s.title}</h2>
              <div style={sectionBodyStyle}>
                {s.body.split('\n').map((line, i) =>
                  line.trim() === '' ? null : (
                    <p key={i} style={line.startsWith('•') ? bulletStyle : paraStyle}>
                      {line}
                    </p>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <p style={footerTextStyle}>
            Questions? Email us at{' '}
            <a href="mailto:hello@kiima.app" style={linkStyle}>hello@kiima.app</a>
          </p>
          <Link href="/" style={linkStyle}>← Back to Kiima</Link>
        </div>
      </div>
    </main>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg)',
  paddingTop: '68px',
  paddingBottom: '80px',
};

const wrapStyle: React.CSSProperties = {
  maxWidth: '720px',
  margin: '0 auto',
  padding: '48px 24px 0',
};

const heroStyle: React.CSSProperties = {
  marginBottom: '48px',
  borderBottom: '2px solid #000000',
  paddingBottom: '32px',
};

const eyebrowStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'var(--color-text-faint)',
  margin: '0 0 12px',
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 800,
  fontSize: 'clamp(32px, 5vw, 48px)',
  color: 'var(--color-text-primary)',
  letterSpacing: '-1.5px',
  lineHeight: 1.05,
  margin: '0 0 12px',
};

const metaStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--color-text-muted)',
  margin: '0 0 20px',
};

const introStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '16px',
  color: 'var(--color-text-secondary)',
  lineHeight: 1.7,
  margin: 0,
};

const sectionsStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0',
};

const sectionStyle: React.CSSProperties = {
  borderBottom: '1px solid var(--color-border)',
  padding: '28px 0',
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '17px',
  color: 'var(--color-text-primary)',
  margin: '0 0 14px',
  letterSpacing: '-0.3px',
};

const sectionBodyStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const paraStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '15px',
  color: 'var(--color-text-secondary)',
  lineHeight: 1.7,
  margin: 0,
};

const bulletStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '15px',
  color: 'var(--color-text-secondary)',
  lineHeight: 1.7,
  margin: '0 0 0 8px',
};

const footerStyle: React.CSSProperties = {
  marginTop: '40px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const footerTextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-muted)',
  margin: 0,
};

const linkStyle: React.CSSProperties = {
  color: 'var(--color-accent)',
  textDecoration: 'none',
  fontWeight: 600,
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
};
