'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard',              label: 'Overview',     tabLabel: 'Home'  },
  { href: '/dashboard/transactions', label: 'Transactions', tabLabel: 'Gifts' },
  { href: '/dashboard/tags',         label: 'Gift Tags',    tabLabel: 'Tags'  },
  { href: '/dashboard/links',        label: 'Links',        tabLabel: 'Links' },
  { href: '/dashboard/pools',        label: 'Pools',        tabLabel: 'Pools' },
];

interface DashboardNavProps {
  variant: 'sidebar' | 'tabs';
}

export default function DashboardNav({ variant }: DashboardNavProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    // Exact match for overview to avoid matching all /dashboard/* routes
    return href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
  }

  if (variant === 'sidebar') {
    return (
      <nav>
        {NAV_ITEMS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`k-nav-link${isActive(href) ? ' k-nav-link--active' : ''}`}
          >
            {label}
          </Link>
        ))}
      </nav>
    );
  }

  // Bottom tab bar — mobile only
  return (
    <nav className="k-dash-tabs">
      {NAV_ITEMS.map(({ href, tabLabel }) => (
        <Link
          key={href}
          href={href}
          className={`k-tab-link${isActive(href) ? ' k-tab-link--active' : ''}`}
        >
          {tabLabel}
        </Link>
      ))}
    </nav>
  );
}
