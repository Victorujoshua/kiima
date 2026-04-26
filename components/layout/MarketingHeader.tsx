'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function MarketingHeader() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
    });
  }, []);

  return (
    <>
      <style>{`
        .mh-wrap {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 60px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 68px;
        }
        .mh-nav-right {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .mh-nav-link {
          font-family: var(--kiima-font);
          font-weight: 500;
          font-size: 14px;
          color: rgba(255,255,255,0.72);
          text-decoration: none;
          transition: color 0.15s;
        }
        .mh-nav-link:hover { color: #ffffff; }
        .mh-btn-nav {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--kiima-font);
          font-weight: 800;
          font-size: 14px;
          padding: 10px 22px;
          min-height: 44px;
          cursor: pointer;
          border: 2px solid #D7D744;
          background: #D7D744;
          color: #000000;
          text-decoration: none;
          white-space: nowrap;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
          box-shadow: 3px 3px 0 0 #C87B5C;
        }
        .mh-btn-nav:hover {
          transform: translate(-2px, -2px);
          box-shadow: 5px 5px 0 0 #C87B5C;
        }
        .mh-btn-nav:active {
          transform: translate(2px, 2px);
          box-shadow: 1px 1px 0 0 #C87B5C;
        }
        .mh-mobile-cta { display: none !important; }
        @media (max-width: 768px) {
          .mh-wrap { padding: 0 20px; }
          .mh-nav-right { display: none !important; }
          .mh-mobile-cta { display: inline-flex !important; }
        }
        @media (max-width: 900px) and (min-width: 769px) {
          .mh-wrap { padding: 0 28px; }
        }
      `}</style>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: '#000000',
        borderBottom: '2px solid #000000',
      }}>
        <div className="mh-wrap">
          <Link href="/" style={logoStyle}>
            kiima<span style={{ color: '#D7D744' }}>.</span>
          </Link>

          <div className="mh-nav-right">
            <Link href="/product" className="mh-nav-link">Product</Link>
            <Link href="/creators" className="mh-nav-link">For Creators</Link>
            {!loggedIn && (
              <Link href="/login" style={{ fontFamily: 'var(--kiima-font)', fontWeight: 600, fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
                Log in
              </Link>
            )}
            <Link href={loggedIn ? '/dashboard' : '/signup'} className="mh-btn-nav">
              {loggedIn ? 'Dashboard →' : 'Get started →'}
            </Link>
          </div>

          <Link href={loggedIn ? '/dashboard' : '/signup'} className="mh-mobile-cta mh-btn-nav" style={{ fontSize: 13, padding: '9px 16px', minHeight: 40 }}>
            {loggedIn ? 'Dashboard' : 'Get started'}
          </Link>
        </div>
      </nav>
    </>
  );
}

const logoStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontWeight: 800,
  fontSize: '26px',
  color: '#ffffff',
  textDecoration: 'none',
  letterSpacing: '-0.02em',
};
