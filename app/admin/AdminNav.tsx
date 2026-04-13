'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', exact: true },
  { href: '/admin/creators', label: 'Creators', exact: false },
  { href: '/admin/transactions', label: 'Transactions', exact: false },
  { href: '/admin/pools', label: 'Pools', exact: false },
  { href: '/admin/tags', label: 'Tags', exact: false },
  { href: '/admin/webhooks', label: 'Webhooks', exact: false },
  { href: '/admin/settings', label: 'Settings', exact: false },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {NAV_ITEMS.map(({ href, label, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: 'block',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              background: isActive ? 'rgba(28, 25, 22, 0.06)' : 'transparent',
              textDecoration: 'none',
              transition: 'background 0.15s ease, color 0.15s ease',
            }}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
