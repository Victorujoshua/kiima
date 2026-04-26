import MarketingHeader from '@/components/layout/MarketingHeader';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Kiima',
  description: 'The terms that govern your use of the Kiima platform.',
};

const LAST_UPDATED = 'April 26, 2026';

const sections = [
  {
    title: '1. Acceptance of terms',
    body: `By creating an account or using Kiima in any way, you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the platform.

We may update these Terms from time to time. Continued use of Kiima after changes are posted constitutes your acceptance of the updated Terms.`,
  },
  {
    title: '2. Eligibility',
    body: `You must be at least 18 years old to create a Kiima account. By using the platform you confirm that you meet this requirement. We reserve the right to terminate accounts of users who misrepresent their age.`,
  },
  {
    title: '3. Your account',
    body: `You are responsible for:
• Keeping your password secure and confidential
• All activity that occurs under your account
• Ensuring your account information is accurate and up to date

You may not share your account credentials or create accounts on behalf of other people without their explicit permission. Notify us immediately at hello@kiima.app if you suspect unauthorised access to your account.`,
  },
  {
    title: '4. Creator responsibilities',
    body: `As a creator on Kiima, you agree to:
• Provide accurate information on your profile
• Use funds received for lawful purposes
• Not misrepresent yourself or your content to encourage gifts
• Not use Kiima for any form of fraud, deception, or money laundering
• Comply with all applicable laws in your jurisdiction regarding income and taxation

Kiima does not provide tax advice. You are solely responsible for reporting and paying any taxes on income received through the platform.`,
  },
  {
    title: '5. Gifter responsibilities',
    body: `As a gifter on Kiima, you agree to:
• Only use payment methods that you are authorised to use
• Not initiate chargebacks for completed transactions without first contacting us
• Not attempt to exploit the platform to obtain refunds for services already rendered`,
  },
  {
    title: '6. Payments and fees',
    body: `All payments are processed by Paystack. By making or receiving a payment on Kiima you also agree to Paystack's terms of service (paystack.com/terms).

Kiima charges a 3% platform fee deducted from each gift at settlement. Paystack charges a processing fee (1.5% + ₦100 per transaction, capped at ₦2,000) which is added to the gifter's total at checkout.

All fees are displayed transparently before any payment is made. Kiima does not guarantee settlement timelines — these are governed by Paystack's payout schedule.`,
  },
  {
    title: '7. Refunds',
    body: `Gifts on Kiima are voluntary and generally non-refundable. Refunds may be issued at our discretion in cases of:
• Duplicate transactions due to technical errors
• Fraudulent transactions confirmed by Paystack

Refund requests must be submitted to hello@kiima.app within 7 days of the transaction. Kiima will investigate and respond within 5 business days.`,
  },
  {
    title: '8. Prohibited conduct',
    body: `You may not use Kiima to:
• Collect gifts under false pretences
• Fund illegal activities or purchases
• Harass, threaten, or abuse other users
• Circumvent platform fees or payment systems
• Upload content that is defamatory, obscene, or infringes third-party rights
• Attempt to access systems or data you are not authorised to access
• Use automated scripts or bots to interact with the platform

Violation of these rules may result in immediate account suspension without notice.`,
  },
  {
    title: '9. Account suspension and termination',
    body: `We reserve the right to suspend or terminate any account at our sole discretion, including — but not limited to — cases of fraud, abuse, or violation of these Terms.

Suspended accounts retain their data for 30 days, after which data may be permanently deleted. We are not liable for any loss resulting from account suspension or termination where such action was taken in good faith.`,
  },
  {
    title: '10. Intellectual property',
    body: `Kiima and its original content, features, and design are the intellectual property of Kiima and are protected by applicable law. You may not copy, modify, distribute, or create derivative works from any part of Kiima without our express written permission.

By submitting content to Kiima (profile photos, bios, etc.) you grant us a non-exclusive, royalty-free licence to display that content on the platform for the purpose of operating the service.`,
  },
  {
    title: '11. Disclaimers',
    body: `Kiima is provided "as is" without warranties of any kind, express or implied. We do not guarantee that:
• The platform will be available at all times
• Payments will be processed without delay or error
• Creator profiles are accurate or represent their owners truthfully

We are not responsible for disputes between creators and gifters. Any such disputes are between the parties involved.`,
  },
  {
    title: '12. Limitation of liability',
    body: `To the maximum extent permitted by law, Kiima shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform — including lost revenue, lost gifts, or data loss — even if we have been advised of the possibility of such damages.

Our total liability to you for any claim arising from your use of Kiima shall not exceed the total fees Kiima has collected from your account in the 12 months preceding the claim.`,
  },
  {
    title: '13. Governing law',
    body: `These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved in the courts of Lagos State, Nigeria. If you access Kiima from outside Nigeria you are responsible for compliance with local laws.`,
  },
  {
    title: '14. Contact',
    body: `Questions about these Terms? Contact us at hello@kiima.app. We aim to respond within 3 business days.`,
  },
];

export default function TermsPage() {
  return (
    <main style={pageStyle}>
      <MarketingHeader />

      <div style={wrapStyle}>
        {/* Header */}
        <div style={heroStyle}>
          <p style={eyebrowStyle}>Legal</p>
          <h1 style={titleStyle}>Terms of Service</h1>
          <p style={metaStyle}>Last updated: {LAST_UPDATED}</p>
          <p style={introStyle}>
            Please read these Terms carefully before using Kiima. They explain your rights and responsibilities as a creator or gifter on the platform.
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
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' as const }}>
            <Link href="/privacy" style={linkStyle}>Privacy Policy</Link>
            <Link href="/" style={linkStyle}>← Back to Kiima</Link>
          </div>
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
  textTransform: 'uppercase' as const,
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
