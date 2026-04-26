'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
    });
  }, []);

  // Landing page is always light mode
  useEffect(() => {
    const saved = localStorage.getItem('kiima-theme');
    document.documentElement.setAttribute('data-theme', 'light');
    return () => {
      document.documentElement.setAttribute('data-theme', saved ?? 'light');
    };
  }, []);

  const faqs = [
    { q: 'Do I need a website to use Kiima?', a: 'No. Kiima gives you a personal page at kiima.app/yourname. Share it in your Instagram bio, TikTok, YouTube description, or anywhere your audience finds you.' },
    { q: 'How do I receive my money?', a: 'Funds settle directly to your Nigerian bank account via Paystack. No wallets, no waiting around — money goes straight to you.' },
    { q: 'How much does Kiima cost?', a: 'Kiima is completely free to use. We only take a small 3% platform fee when a gift is successfully sent — so we only earn when you do.' },
    { q: 'What is a Support Pool?', a: 'A Support Pool is a crowd-funded goal. Set a target amount, share your pool link, and let your community contribute together — perfect for projects, equipment, events, or emergencies.' },
    { q: 'Can my supporters choose how much to give?', a: 'Yes. You can set Gift Tags as preset options (like "Buy me a drink 🥤 — ₦2,000") and supporters can also enter any custom amount they like.' },
    { q: 'Is Kiima only for Nigerian creators?', a: 'Kiima is optimised for Nigerian creators and currently supports NGN. USD, GBP, and EUR are also supported for international creators.' },
  ];

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }

        .lp-wrap { max-width: 1120px; margin: 0 auto; padding: 0 60px; }

        /* Hero */
        .lp-hero-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 100px 0 90px;
          position: relative;
          z-index: 1;
        }

        /* Feature sections */
        .lp-feat-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        .lp-feat-grid--rev { direction: rtl; }
        .lp-feat-grid--rev > * { direction: ltr; }

        /* How it works */
        .lp-how-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 56px;
        }

        /* Testimonials */
        .lp-testi-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        /* Pricing */
        .lp-pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          max-width: 720px;
          margin: 0 auto;
        }

        /* Buttons — neobrutalist */
        .lp-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--kiima-font);
          font-weight: 800;
          font-size: 15px;
          padding: 14px 28px;
          text-decoration: none;
          white-space: nowrap;
          min-height: 52px;
          cursor: pointer;
          border: 2px solid #000000;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
          position: relative;
        }
        .lp-btn-dark {
          color: #000000;
          background: var(--kiima-olive);
          box-shadow: 4px 4px 0 0 #000000;
        }
        .lp-btn-dark:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0 0 #000000;
        }
        .lp-btn-dark:active {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0 0 #000000;
        }
        .lp-btn-outline {
          color: #000000;
          background: transparent;
          border: 2px solid #000000;
          box-shadow: 4px 4px 0 0 #000000;
        }
        .lp-btn-outline:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0 0 #000000;
        }
        .lp-btn-white {
          color: #000000;
          background: var(--kiima-white);
          border: 2px solid #000000;
          box-shadow: 4px 4px 0 0 rgba(0,0,0,0.35);
        }
        .lp-btn-white:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0 0 rgba(0,0,0,0.35);
        }
        .lp-btn-white:active {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0 0 rgba(0,0,0,0.35);
        }
        .lp-btn-outline-white {
          color: #fff;
          background: transparent;
          border: 2px solid rgba(255,255,255,0.7);
          box-shadow: 4px 4px 0 0 rgba(255,255,255,0.25);
        }
        .lp-btn-outline-white:hover {
          border-color: #fff;
          box-shadow: 6px 6px 0 0 rgba(255,255,255,0.35);
          transform: translate(-2px, -2px);
        }

        /* Nav */
        .lp-nav-right { display: flex; align-items: center; gap: 24px; }
        .lp-nav-mobile { display: none !important; }

        /* Nav CTA button — olive on black */
        .lp-btn-nav {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--kiima-font);
          font-weight: 800;
          font-size: 14px;
          padding: 10px 22px;
          min-height: 44px;
          cursor: pointer;
          border: 2px solid var(--kiima-olive);
          background: var(--kiima-olive);
          color: #000000;
          text-decoration: none;
          white-space: nowrap;
          transition: transform 0.22s ease, box-shadow 0.22s ease, background 0.15s ease;
          box-shadow: 3px 3px 0 0 var(--kiima-orange);
        }
        .lp-btn-nav:hover {
          transform: translate(-2px, -2px);
          box-shadow: 5px 5px 0 0 var(--kiima-orange);
        }
        .lp-btn-nav:active {
          transform: translate(2px, 2px);
          box-shadow: 1px 1px 0 0 var(--kiima-orange);
        }

        /* FAQ */
        .lp-faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }
        .lp-faq-answer--open { max-height: 300px; }

        /* Nav link — white on black header */
        .lp-nav-link {
          font-family: var(--kiima-font);
          font-weight: 500;
          font-size: 14px;
          color: rgba(255,255,255,0.72);
          text-decoration: none;
          transition: color 0.15s;
        }
        .lp-nav-link:hover { color: #ffffff; }

        /* Section headings */
        .lp-eyebrow {
          font-family: var(--kiima-font);
          font-weight: 700;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #000000;
          opacity: 0.45;
          margin: 0 0 14px;
        }

        @media (max-width: 900px) {
          .lp-wrap { padding: 0 28px; }
          .lp-hero-center { padding: 70px 0 60px; }
          .lp-hero-ctas { justify-content: center !important; }
          .lp-hero-sub { max-width: 480px !important; }
          .lp-feat-grid { grid-template-columns: 1fr; gap: 40px; }
          .lp-feat-grid--rev { direction: ltr; }
          .lp-feat-grid--rev .lp-feat-visual { order: -1; }
          .lp-feat-visual { display: flex; justify-content: center; }
          .lp-feat-text { text-align: left; }
          .lp-feat-btn-row { justify-content: flex-start; }
          .lp-how-grid { grid-template-columns: 1fr; gap: 36px; }
          .lp-how-step { text-align: left; }
          .lp-testi-grid { grid-template-columns: 1fr; gap: 16px; }
          .lp-pricing-grid { grid-template-columns: 1fr; }
          .lp-faq-layout { grid-template-columns: 1fr !important; gap: 36px !important; }
          .lp-faq-sticky { position: static !important; }
          .lp-feat-section { padding: 64px 0 !important; }
          .lp-proof-label { flex-basis: 100%; text-align: center; }
          .lp-proof-bar { justify-content: center; gap: 10px !important; }
          .lp-how-header { flex-direction: column !important; gap: 8px !important; align-items: flex-start !important; }
        }

        @media (max-width: 768px) {
          /* Navbar: logo left, CTA right, hide nav links */
          .lp-nav-inner { justify-content: space-between !important; }
          .lp-nav-right { display: none !important; }
          .lp-nav-mobile { display: inline-flex !important; }

          /* Hero: center everything in the text column */
          .lp-hero-text { display: flex; flex-direction: column; align-items: center; text-align: center; }
          .lp-hero-headline { text-align: center; }
          .lp-hero-sub { text-align: center !important; margin-left: auto !important; margin-right: auto !important; }
          .lp-hero-ctas { justify-content: center !important; width: 100%; }
          .lp-hero-ctas > * { flex: 1; text-align: center; justify-content: center; }
          .lp-hero-note { text-align: center !important; }

          /* Section headings & eyebrows */
          .lp-eyebrow { text-align: center; display: block; }
          .lp-section-h2 { text-align: center !important; }

          /* How it works: center numbers, title, body */
          .lp-how-header { justify-content: center !important; text-align: center !important; flex-direction: column !important; align-items: center !important; gap: 16px !important; }
          .lp-how-header > div { text-align: center; }
          .lp-how-step { text-align: center !important; display: flex; flex-direction: column; align-items: center; }
          .lp-how-num { margin-left: auto; margin-right: auto; }

          /* Feature sections: center text and buttons */
          .lp-feat-text { text-align: center !important; display: flex; flex-direction: column; align-items: center; }
          .lp-feat-h2 { text-align: center !important; }
          .lp-feat-btn-row { justify-content: center !important; }
          .lp-feat-btn-row > * { flex: 1; text-align: center !important; justify-content: center; }

          /* Testimonials */
          .lp-testi-card { text-align: center; }

          /* FAQ sticky column */
          .lp-faq-sticky { text-align: center; display: flex; flex-direction: column; align-items: center; }
          .lp-faq-sticky .lp-btn { align-self: center; }

          /* Footer */
          .lp-footer-top { flex-direction: column !important; align-items: center !important; text-align: center; gap: 20px !important; }
          .lp-footer-links { justify-content: center !important; }
        }

        @media (max-width: 600px) {
          /* Coins: push top-corners above text line, hide side coins */
          .lp-coin-tl { top: -155px !important; left: -130px !important; }
          .lp-coin-tr { top: -85px !important;  right: -80px !important; }
          .lp-coin-ml { display: none !important; }
          .lp-coin-br { display: none !important; }

          .lp-wrap { padding: 0 20px; }
          .lp-hero-headline { font-size: 40px !important; letter-spacing: -0.025em !important; }
          .lp-section-h2 { font-size: 30px !important; }
          .lp-feat-h2 { font-size: 32px !important; }
          .lp-final-h2 { font-size: 36px !important; }
          .lp-hero-ctas { flex-wrap: wrap !important; }
          .lp-hero-ctas > * { flex: 1; min-width: 150px; text-align: center; justify-content: center; }
          .lp-feat-btn-row { flex-direction: column; width: 100%; }
          .lp-feat-btn-row > * { width: 100% !important; text-align: center; justify-content: center; }
          .lp-mockup-scale { width: 100%; display: flex; justify-content: center; }
          .lp-mockup-scale > * { max-width: 100%; }
        }
      `}</style>

      <div style={{ background: 'var(--color-bg)', fontFamily: 'var(--kiima-font)' }}>

        {/* ── NAVBAR — fixed black ────────────────────────────────── */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: '#000000',
          borderBottom: '2px solid #000000',
        }}>
          <div className="lp-wrap lp-nav-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 68 }}>
            <Link href="/" style={logoStyle}>
              kiima<span style={{ color: 'var(--kiima-olive)' }}>.</span>
            </Link>
            <div className="lp-nav-right">
              <a href="#features" className="lp-nav-link">Features</a>
              <a href="#how-it-works" className="lp-nav-link">How it works</a>
              <a href="#pricing" className="lp-nav-link">Pricing</a>
              <a href="#faq" className="lp-nav-link">FAQ</a>
              {!loggedIn && (
                <Link href="/login" style={{ fontFamily: 'var(--kiima-font)', fontWeight: 600, fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Log in</Link>
              )}
              <Link href={loggedIn ? '/dashboard' : '/signup'} className="lp-btn-nav">
                {loggedIn ? 'Dashboard →' : 'Get started →'}
              </Link>
            </div>
            <Link href={loggedIn ? '/dashboard' : '/signup'} className="lp-nav-mobile lp-btn-nav" style={{ fontSize: 13, padding: '9px 16px', minHeight: 40 }}>
              {loggedIn ? 'Dashboard' : 'Get started'}
            </Link>
          </div>
        </nav>

        {/* Spacer for fixed navbar */}
        <div style={{ height: 68 }} />

        {/* ── HERO ───────────────────────────────────────────────── */}
        <section style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Floating coins */}
          <KiimaCoin className="lp-coin-tl" size={210} style={{ top: -50, left: -75, transform: 'rotate(-25deg)' }} />
          <KiimaCoin className="lp-coin-tr" size={148} style={{ top: -20, right: -48, transform: 'rotate(18deg)' }} />
          <KiimaCoin className="lp-coin-ml" size={245} style={{ top: '32%', left: -115, transform: 'translateY(-50%) rotate(-10deg)' }} />
          <KiimaCoin className="lp-coin-br" size={172} style={{ bottom: -15, right: -52, transform: 'rotate(28deg)' }} />

          <div className="lp-wrap">
            <div className="lp-hero-center">
              <span style={{
                display: 'inline-block',
                fontFamily: 'var(--kiima-font)', fontWeight: 700, fontSize: 12,
                color: '#000000', background: 'var(--kiima-olive)',
                border: '2px solid #000000',
                padding: '6px 16px', marginBottom: 28,
                letterSpacing: '0.04em',
              }}>🇳🇬 Built for Nigerian creators</span>

              <h1 className="lp-hero-headline" style={{
                fontFamily: 'var(--kiima-font)', fontWeight: 800,
                fontSize: 'clamp(44px, 6vw, 72px)', color: 'var(--color-text-primary)',
                lineHeight: 1.04, letterSpacing: '-2.5px',
                margin: '0 0 24px', maxWidth: 720,
              }}>
                The easiest way to receive gifts from your fans.
              </h1>

              <p className="lp-hero-sub" style={{
                fontFamily: 'var(--kiima-font)', fontSize: 18,
                color: 'var(--color-text-secondary)', lineHeight: 1.65,
                margin: '0 0 36px', maxWidth: 520,
              }}>
                A personal gift link, custom Gift Tags, and collaborative Support Pools — built for Nigerian creators, powered by Paystack.
              </p>

              <div className="lp-hero-ctas" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link href="/signup" className="lp-btn lp-btn-dark">Get started free</Link>
                <a href="#how-it-works" className="lp-btn lp-btn-outline">How it works ↓</a>
              </div>

              <p className="lp-hero-note" style={{ fontFamily: 'var(--kiima-font)', fontSize: 13, color: 'var(--color-text-muted)', marginTop: 20 }}>
                Free forever · No credit card · Set up in minutes
              </p>
            </div>
          </div>
        </section>

        {/* ── PROOF BAR ──────────────────────────────────────────── */}
        <div style={{
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
          padding: '24px 0',
        }}>
          <div className="lp-wrap">
            <div className="lp-proof-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
              <span className="lp-proof-label" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: 'var(--color-text-muted)' }}>
                Used by creators across Nigeria:
              </span>
              {['Content Creators', 'Musicians', 'Comedians', 'Podcasters', 'Coaches', 'Entrepreneurs'].map(c => (
                <span key={c} style={{
                  fontFamily: 'var(--kiima-font)', fontWeight: 700, fontSize: 13,
                  color: '#000000',
                  background: 'var(--kiima-olive)',
                  border: '2px solid #000000',
                  padding: '5px 14px',
                }}>{c}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── HOW IT WORKS ───────────────────────────────────────── */}
        <section id="how-it-works" style={{ background: 'var(--color-surface)', padding: '88px 0' }}>
          <div className="lp-wrap">
            <div className="lp-how-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 60, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h2 className="lp-section-h2" style={{ ...sectionH2Style, margin: 0 }}>How it works</h2>
              </div>
              <Link href="/signup" style={{ fontFamily: 'var(--kiima-font)', fontWeight: 800, fontSize: 14, color: '#000000', textDecoration: 'none' }}>
                Get started →
              </Link>
            </div>

            <div className="lp-how-grid">
              {[
                { n: '01', title: 'Create your link', body: 'Sign up, choose your username, and your gift page is live at kiima.app/yourname instantly. No setup fees. No waiting.' },
                { n: '02', title: 'Share it everywhere', body: 'Drop your Kiima link in your Instagram bio, TikTok, YouTube description, or anywhere your audience finds you.' },
                { n: '03', title: 'Receive gifts', body: 'Your supporters send gifts directly to you. Funds settle to your Nigerian bank account via Paystack.' },
              ].map(step => (
                <div key={step.n} className="lp-how-step">
                  <div className="lp-how-num" style={{
                    width: 48, height: 48,
                    background: 'var(--kiima-olive)',
                    border: '2px solid #000000',
                    boxShadow: '3px 3px 0 0 #000000',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--kiima-font)', fontWeight: 800, fontSize: 16,
                    color: '#000000', marginBottom: 20,
                  }}>{step.n}</div>
                  <h3 style={{ fontFamily: 'var(--kiima-font)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.5px', color: 'var(--color-text-primary)', margin: '0 0 10px' }}>{step.title}</h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: 0 }}>{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURE SECTIONS ───────────────────────────────────── */}
        <div id="features">

          {/* 1. Gift Link — forest green */}
          <section className="lp-feat-section" style={{ background: 'var(--color-section-green)', padding: '96px 0', overflow: 'hidden' }}>
            <div className="lp-wrap">
              <div className="lp-feat-grid">
                <div className="lp-feat-text">
                  <p className="lp-eyebrow" style={{ color: 'rgba(255,255,255,0.55)' }}>Step 01</p>
                  <h2 className="lp-feat-h2" style={{ fontFamily: 'var(--kiima-font)', fontWeight: 800, fontSize: 44, color: '#fff', lineHeight: 1.08, letterSpacing: '-0.025em', margin: '0 0 20px' }}>
                    Your personal<br />gift link
                  </h2>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'rgba(255,255,255,0.82)', lineHeight: 1.7, margin: '0 0 32px', maxWidth: 380 }}>
                    Get a beautiful page at <strong style={{ color: '#fff', fontWeight: 700 }}>kiima.app/yourname</strong>. Share it anywhere — Instagram bio, TikTok, WhatsApp — and start receiving gifts instantly. No setup fees, no waiting.
                  </p>
                  <div className="lp-feat-btn-row" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <Link href="/signup" className="lp-btn lp-btn-white">Get your link free →</Link>
                    <a href="#how-it-works" className="lp-btn lp-btn-outline-white">Learn more</a>
                  </div>
                </div>
                <div className="lp-feat-visual" style={{ display: 'flex', justifyContent: 'center' }}>
                  <div className="lp-mockup-scale"><GiftPageMockup /></div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Dashboard — dark */}
          <section className="lp-feat-section" style={{ background: 'var(--color-text-primary)', padding: '96px 0', overflow: 'hidden' }}>
            <div className="lp-wrap">
              <div className="lp-feat-grid lp-feat-grid--rev">
                <div className="lp-feat-text">
                  <p className="lp-eyebrow" style={{ color: 'var(--color-accent)' }}>Step 02</p>
                  <h2 className="lp-feat-h2" style={{ fontFamily: 'var(--kiima-font)', fontWeight: 800, fontSize: 44, color: '#F6F3EE', lineHeight: 1.08, letterSpacing: '-0.025em', margin: '0 0 20px' }}>
                    A dashboard<br />that shows<br />everything
                  </h2>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'rgba(246,243,238,0.72)', lineHeight: 1.7, margin: '0 0 32px', maxWidth: 380 }}>
                    See every gift, track your pools, manage your tags, and connect your social links — all from one clean, easy-to-use creator dashboard.
                  </p>
                  <Link href="/signup" className="lp-btn lp-btn-white">Start tracking →</Link>
                </div>
                <div className="lp-feat-visual" style={{ display: 'flex', justifyContent: 'center' }}>
                  <div className="lp-mockup-scale"><DashboardMockup /></div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Gift Tags — light warm */}
          <section className="lp-feat-section" style={{ background: 'var(--color-bg)', padding: '96px 0', overflow: 'hidden' }}>
            <div className="lp-wrap">
              <div className="lp-feat-grid">
                <div className="lp-feat-text">
                  <p className="lp-eyebrow">Step 03</p>
                  <h2 className="lp-feat-h2" style={{ fontFamily: 'var(--kiima-font)', fontWeight: 800, fontSize: 44, color: 'var(--color-text-primary)', lineHeight: 1.08, letterSpacing: '-0.025em', margin: '0 0 20px' }}>
                    Gift Tags that<br />make giving easy
                  </h2>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: '0 0 32px', maxWidth: 380 }}>
                    Set up preset gift options — "Buy me a drink 🥤", "Fund my next video 🎬", or whatever feels like you. Supporters pick a tag and send instantly, no awkward guessing.
                  </p>
                  <Link href="/signup" className="lp-btn lp-btn-dark">Add your tags →</Link>
                </div>
                <div className="lp-feat-visual" style={{ display: 'flex', justifyContent: 'center' }}>
                  <div className="lp-mockup-scale"><GiftTagsMockup /></div>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Support Pools — terracotta */}
          <section className="lp-feat-section" style={{ background: 'var(--color-accent)', padding: '96px 0', overflow: 'hidden' }}>
            <div className="lp-wrap">
              <div className="lp-feat-grid lp-feat-grid--rev">
                <div className="lp-feat-text">
                  <p className="lp-eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Step 04</p>
                  <h2 className="lp-feat-h2" style={{ fontFamily: 'var(--kiima-font)', fontWeight: 800, fontSize: 44, color: '#fff', lineHeight: 1.08, letterSpacing: '-0.025em', margin: '0 0 20px' }}>
                    Support Pools<br />for your biggest<br />goals
                  </h2>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'rgba(255,255,255,0.88)', lineHeight: 1.7, margin: '0 0 32px', maxWidth: 380 }}>
                    Set a funding goal and let your community rally together. Perfect for projects, equipment, events, or anything you're working towards. Watch your pool fill up.
                  </p>
                  <div className="lp-feat-btn-row" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <Link href="/signup" className="lp-btn lp-btn-white">Create a pool →</Link>
                    <a href="#faq" className="lp-btn lp-btn-outline-white">Learn more</a>
                  </div>
                </div>
                <div className="lp-feat-visual" style={{ display: 'flex', justifyContent: 'center' }}>
                  <div className="lp-mockup-scale"><PoolMockup /></div>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* ── PRICING ────────────────────────────────────────────── */}
        <section id="pricing" style={{ background: 'var(--color-surface)', padding: '88px 0' }}>
          <div className="lp-wrap">
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <p className="lp-eyebrow" style={{ textAlign: 'center' }}>Pricing</p>
              <h2 className="lp-section-h2" style={{ ...sectionH2Style, marginBottom: 14 }}>
                Free to start.<br />We only earn when you do.
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--color-text-secondary)', lineHeight: 1.65, maxWidth: 480, margin: '0 auto' }}>
                No monthly fees. No subscriptions. Kiima takes a small fee only when a gift is sent.
              </p>
            </div>
            <div className="lp-pricing-grid">
              {[
                { label: '3%', sub: 'Platform fee', detail: 'Only on successful gifts. We only earn when you do.', accent: true },
                { label: '₦0', sub: 'Monthly fee', detail: 'Kiima is completely free to use, forever.' },
                { label: '0', sub: 'Hidden charges', detail: 'Transparent pricing, always. No surprises.' },
              ].map(f => (
                <div key={f.label} style={{
                  background: f.accent ? 'var(--kiima-olive)' : 'var(--color-bg)',
                  border: '2px solid #000000',
                  boxShadow: '4px 4px 0 0 #000000',
                  padding: '28px 24px',
                  textAlign: 'center',
                }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 44, color: 'var(--color-accent)', margin: '0 0 8px', lineHeight: 1 }}>{f.label}</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>{f.sub}</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.55, margin: 0 }}>{f.detail}</p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <Link href="/signup" className="lp-btn lp-btn-dark">Start for free →</Link>
            </div>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────── */}
        <section id="faq" style={{ background: 'var(--color-bg)', padding: '88px 0' }}>
          <div className="lp-wrap">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 80, alignItems: 'start' }} className="lp-faq-layout">
              <div className="lp-faq-sticky" style={{ position: 'sticky', top: 96 }}>
                <p className="lp-eyebrow">FAQ</p>
                <h2 className="lp-section-h2" style={{ ...sectionH2Style, fontSize: 36, marginBottom: 16 }}>
                  Questions?<br />We have answers.
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.65, margin: '0 0 24px' }}>
                  Still have questions? Email us at <span style={{ color: 'var(--color-accent)' }}>hello@kiima.app</span>
                </p>
                <Link href="/signup" className="lp-btn lp-btn-dark" style={{ fontSize: 14, padding: '11px 22px', minHeight: 44 }}>Get started →</Link>
              </div>
              <div>
                {faqs.map((faq, i) => (
                  <div key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', padding: '22px 0',
                        background: 'none', border: 'none', cursor: 'pointer', gap: 16, textAlign: 'left',
                      }}
                    >
                      <span style={{ fontFamily: 'var(--kiima-font)', fontWeight: 600, fontSize: 16, color: 'var(--color-text-primary)' }}>{faq.q}</span>
                      <span style={{
                        fontSize: 22, color: 'var(--color-text-muted)', flexShrink: 0, lineHeight: 1,
                        transition: 'transform 0.2s ease',
                        transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)',
                        display: 'block',
                      }}>+</span>
                    </button>
                    <div className={`lp-faq-answer${openFaq === i ? ' lp-faq-answer--open' : ''}`}>
                      <p style={{ fontFamily: 'var(--kiima-font)', fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.7, paddingBottom: 22, margin: 0 }}>{faq.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ───────────────────────────────────────── */}
        <section style={{ background: 'var(--color-surface)', padding: '88px 0' }}>
          <div className="lp-wrap">
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <p className="lp-eyebrow" style={{ textAlign: 'center' }}>Creators love Kiima</p>
              <h2 className="lp-section-h2" style={sectionH2Style}>Real people, real support</h2>
            </div>
            <div className="lp-testi-grid">
              {[
                { quote: 'I put my Kiima link in my bio and woke up to three gifts the next morning. It felt so personal — nothing like a PayPal link.', name: 'Adeola Bello', handle: '@adeola.creates', role: 'Content Creator · Lagos' },
                { quote: 'My fans used a support pool to help fund my EP. We hit the goal in 11 days. I was in tears. Kiima made that possible.', name: 'Emeka Okafor', handle: '@emekamusic_', role: 'Musician · Abuja' },
                { quote: 'Setting up took five minutes. The gift tags are such a smart touch — people actually use them. It removes all the awkwardness.', name: 'Fatima Abubakar', handle: '@thefatimapod', role: 'Podcaster · Kano' },
              ].map(t => (
                <div key={t.name} className="lp-testi-card" style={{ background: 'var(--color-surface)', border: '2px solid #000000', boxShadow: '4px 4px 0 0 #000000', padding: 32, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 32, color: 'var(--color-accent)', marginBottom: 16, fontFamily: 'Georgia, serif' }}>&ldquo;</div>
                  <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 17, color: 'var(--color-text-primary)', lineHeight: 1.65, flex: 1, margin: '0 0 auto' }}>{t.quote}</p>
                  <div style={{ paddingTop: 22, borderTop: '1px solid var(--color-border)', marginTop: 22 }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)', margin: 0 }}>{t.name}</p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-accent)', margin: '2px 0' }}>{t.handle}</p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ──────────────────────────────────────────── */}
        <section style={{ background: 'var(--color-text-primary)', padding: '112px 0' }}>
          <div className="lp-wrap" style={{ textAlign: 'center' }}>
            <h2 className="lp-final-h2" style={{
              fontFamily: 'var(--kiima-font)', fontWeight: 800, fontSize: 'clamp(36px, 5vw, 64px)',
              color: '#F6F3EE', lineHeight: 1.06, letterSpacing: '-2px',
              margin: '0 0 20px',
            }}>
              Say goodbye to awkward<br />payment requests,<br />and start receiving<br />with grace.
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, color: 'rgba(246,243,238,0.55)', lineHeight: 1.65, marginBottom: 44 }}>
              Join creators already earning from their passion on Kiima.
            </p>
            <Link href="/signup" className="lp-btn lp-btn-white" style={{ fontSize: 16, padding: '16px 40px', minHeight: 58 }}>
              Get started free →
            </Link>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(246,243,238,0.35)', marginTop: 18 }}>
              Free forever · No credit card needed
            </p>
          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────────────────────── */}
        <footer style={{ background: 'var(--color-text-primary)', borderTop: '1px solid rgba(246,243,238,0.07)', padding: '40px 0' }}>
          <div className="lp-wrap">
            <div className="lp-footer-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24, paddingBottom: 28, borderBottom: '1px solid rgba(246,243,238,0.07)' }}>
              <Link href="/" style={logoStyle}>
                kiima<span style={{ color: 'var(--kiima-olive)' }}>.</span>
              </Link>
              <div className="lp-footer-links" style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                {[{ label: 'Product', href: '/product' }, { label: 'Creators', href: '/creators' }, { label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' }].map(({ label, href }) => (
                  <Link key={label} href={href} style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(246,243,238,0.4)', textDecoration: 'none' }}>{label}</Link>
                ))}
              </div>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(246,243,238,0.28)', marginTop: 22, textAlign: 'center' }}>
              © 2025 Kiima · Made with ❤️ in Nigeria
            </p>
          </div>
        </footer>

      </div>
    </>
  );
}

// ─── Shared styles ─────────────────────────────────────────────────────────────

const logoStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontWeight: 800,
  fontSize: 26,
  color: '#ffffff',
  textDecoration: 'none',
  letterSpacing: '-0.02em',
};

const sectionH2Style: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontWeight: 800,
  fontSize: 44,
  color: 'var(--color-text-primary)',
  margin: '0 0 16px',
  lineHeight: 1.1,
  letterSpacing: '-1.5px',
};

// ─── Kiima Coin — floating neobrutalist coin decoration ───────────────────────

function KiimaCoin({ size = 160, style, className }: { size?: number; style?: React.CSSProperties; className?: string }) {
  return (
    <div className={className} style={{ position: 'absolute', width: size, height: size, ...style }}>
      <svg viewBox="0 0 100 108" width={size} height={size}>
        {/* 3D depth layer — dark olive, offset down */}
        <circle cx="52" cy="58" r="44" fill="#7a7a00" />
        {/* Face circle */}
        <circle cx="50" cy="50" r="44" fill="#D7D744" stroke="#000000" strokeWidth="4" />
        {/* Heart icon */}
        <path
          d="M50 67
             C50 67 24 53 24 38
             C24 28 31 22 40 22
             C44 22 47 25 50 29
             C53 25 56 22 60 22
             C69 22 76 28 76 38
             C76 53 50 67 50 67 Z"
          fill="#000000"
        />
      </svg>
    </div>
  );
}

// ─── Gift Page Mockup ──────────────────────────────────────────────────────────

function GiftPageMockup() {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      overflow: 'hidden',
      width: 300,
      maxWidth: '100%',
      boxShadow: '0 32px 72px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
    }}>
      {/* Browser chrome */}
      <div style={{ background: '#F0EDE8', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
        </div>
        <div style={{ flex: 1, background: '#fff', borderRadius: 6, padding: '4px 10px', textAlign: 'center' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#888' }}>kiima.app/adeola</span>
        </div>
      </div>
      <div style={{ padding: '20px 18px 22px', background: '#F6F3EE' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(135deg, #FF5C00 0%, #FF8040 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, marginBottom: 8 }}>A</div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 500, color: '#1C1916', margin: 0 }}>Adeola Bello</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#9A9089', margin: '3px 0 6px' }}>@adeola.creates</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#5A4D44', margin: 0, textAlign: 'center', lineHeight: 1.45 }}>Content creator 🎬 · Lifestyle · Lagos</p>
        </div>
        <div style={{ height: 1, background: 'rgba(28,25,22,0.06)', marginBottom: 14 }} />
        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#B5AAAA', marginBottom: 10 }}>Send a gift</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {[['☕', '₦2k'], ['🎬', '₦5k'], ['❤️', '₦10k']].map(([e, a]) => (
            <span key={a} style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, background: '#FFF0EB', color: '#FF5C00', border: '1.5px solid rgba(200,123,92,0.22)', borderRadius: 100, padding: '5px 12px' }}>{e} {a}</span>
          ))}
        </div>
        <div style={{ background: '#fff', border: '1.5px solid rgba(28,25,22,0.08)', borderRadius: 10, padding: '8px 12px', marginBottom: 10 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#B5AAAA', margin: '0 0 2px' }}>Amount</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 20, fontWeight: 700, color: '#1C1916', margin: 0 }}>₦ 2,000</p>
        </div>
        <div style={{ background: '#1C1916', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, color: '#fff' }}>Send gift ❤️</span>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Mockup ──────────────────────────────────────────────────────────

function DashboardMockup() {
  return (
    <div style={{
      width: 340,
      maxWidth: '100%',
      borderRadius: 16,
      padding: '20px',
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 32px 72px rgba(0,0,0,0.4)',
    }}>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Received', value: '₦284k' },
          { label: 'Gifts', value: '47' },
          { label: 'Pools', value: '3' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(246,243,238,0.38)', margin: '0 0 5px' }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, fontWeight: 700, color: '#F6F3EE', margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>
      {/* Recent gifts */}
      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '14px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(246,243,238,0.3)', margin: '0 0 12px' }}>Recent gifts</p>
        {[
          { name: 'Chidi O.', amount: '₦5,000', tag: '🎬', time: '2h ago' },
          { name: 'Anonymous', amount: '₦2,000', tag: '☕', time: '5h ago' },
          { name: 'Amaka B.', amount: '₦10,000', tag: '❤️', time: '1d ago' },
        ].map((row, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(200,123,92,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>{row.tag}</div>
              <div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(246,243,238,0.75)', margin: 0 }}>{row.name}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'rgba(246,243,238,0.3)', margin: 0 }}>{row.time}</p>
              </div>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, color: '#FF5C00', margin: 0 }}>{row.amount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Gift Tags Mockup ──────────────────────────────────────────────────────────

function GiftTagsMockup() {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 20,
      padding: '28px',
      boxShadow: '0 20px 60px rgba(28,25,22,0.14)',
      width: 320,
      maxWidth: '100%',
    }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#B5AAAA', margin: '0 0 14px' }}>Choose a gift tag</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, background: '#FF5C00', color: '#fff', borderRadius: 100, padding: '9px 16px' }}>☕ Coffee · ₦2,000</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, background: '#FFF0EB', color: '#FF5C00', border: '1.5px solid rgba(200,123,92,0.25)', borderRadius: 100, padding: '9px 16px' }}>🎬 Collab · ₦5,000</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, background: '#FFF0EB', color: '#FF5C00', border: '1.5px solid rgba(200,123,92,0.25)', borderRadius: 100, padding: '9px 16px' }}>🌟 VIP · ₦20,000</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, background: '#F6F3EE', color: '#9A9089', border: '1.5px dashed rgba(28,25,22,0.12)', borderRadius: 100, padding: '9px 16px' }}>+ Add tag</span>
      </div>
      <div style={{ background: '#F6F3EE', border: '1.5px solid rgba(200,123,92,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 12 }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#B5AAAA', margin: '0 0 4px' }}>Amount</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 26, fontWeight: 700, color: '#1C1916', margin: 0 }}>₦ 2,000</p>
      </div>
      <div style={{ background: '#F6F3EE', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#9A9089', margin: 0, lineHeight: 1.55 }}>
          You're sending ₦2,000 · Processing fee ₦130 · <strong style={{ color: '#1C1916' }}>Total ₦2,130</strong>
        </p>
      </div>
      <div style={{ background: '#1C1916', borderRadius: 12, padding: '13px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, color: '#fff' }}>Send gift ❤️</span>
      </div>
    </div>
  );
}

// ─── Pool Mockup ───────────────────────────────────────────────────────────────

function PoolMockup() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.18)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.28)',
      borderRadius: 20,
      padding: '24px',
      width: 300,
      maxWidth: '100%',
      boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 500, color: '#fff', margin: 0, flex: 1, lineHeight: 1.3 }}>Fund my next film project 🎬</p>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700, background: 'rgba(255,255,255,0.22)', color: '#fff', borderRadius: 100, padding: '4px 10px', marginLeft: 10, whiteSpace: 'nowrap', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Open</span>
      </div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.62)', margin: '0 0 20px', lineHeight: 1.5 }}>Help me create my first short film. Every naira counts!</p>
      {/* Progress track */}
      <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 100, height: 7, marginBottom: 10, overflow: 'hidden' }}>
        <div style={{ width: '68%', height: '100%', background: 'linear-gradient(to right, rgba(255,255,255,0.95), rgba(255,255,255,0.6))', borderRadius: 100 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, color: '#fff', margin: 0 }}>₦340,000 raised</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0 }}>68% of ₦500k</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.14)', paddingTop: 16 }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.58)', margin: 0 }}>24 contributors</p>
        <div style={{ background: 'rgba(255,255,255,0.92)', borderRadius: 10, padding: '9px 18px' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, color: '#FF5C00' }}>Support this 🤍</span>
        </div>
      </div>
    </div>
  );
}
