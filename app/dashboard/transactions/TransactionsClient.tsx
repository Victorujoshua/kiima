'use client';

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import ContributionRow from '@/components/shared/ContributionRow';
import type { Contribution, Currency } from '@/types';

interface ContributionWithPool extends Contribution {
  pool?: { title: string } | null;
}

interface Props {
  contributions: ContributionWithPool[];
  currency: Currency;
}

const AMOUNT_FILTERS = [
  { label: 'All amounts', min: 0,     max: Infinity },
  { label: 'Under ₦2k',  min: 0,     max: 2000     },
  { label: '₦2k – ₦10k', min: 2000,  max: 10000    },
  { label: '₦10k – ₦50k',min: 10000, max: 50000    },
  { label: 'Over ₦50k',  min: 50000, max: Infinity  },
];

export default function TransactionsClient({ contributions, currency }: Props) {
  const [search,     setSearch]     = useState('');
  const [amountIdx,  setAmountIdx]  = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    const q   = search.trim().toLowerCase();
    const { min, max } = AMOUNT_FILTERS[amountIdx];
    return contributions.filter(c => {
      const name   = (c.display_name ?? 'Anonymous').toLowerCase();
      const source = c.pool ? c.pool.title.toLowerCase() : 'direct gift';
      const matchQ = !q || name.includes(q) || source.includes(q);
      const amt    = Number(c.gift_amount);
      return matchQ && amt >= min && amt < max;
    });
  }, [contributions, search, amountIdx]);

  return (
    <>
      <h1 className="k-dash-page-title">All gifts</h1>

      {/* ── Search + filter bar ── */}
      <div style={toolbarStyle}>
        {/* Search */}
        <div style={searchWrapStyle}>
          <Search size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          <input
            className="k-input"
            style={searchInputStyle}
            type="text"
            placeholder="Search by name or source…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Amount filter */}
        <div style={{ position: 'relative' }}>
          <button
            style={{
              ...filterBtnStyle,
              background: amountIdx !== 0 ? 'var(--kiima-olive)' : 'var(--color-surface)',
            }}
            onClick={() => setFilterOpen(p => !p)}
          >
            <SlidersHorizontal size={15} />
            {AMOUNT_FILTERS[amountIdx].label}
          </button>

          {filterOpen && (
            <div style={dropdownStyle}>
              {AMOUNT_FILTERS.map((f, i) => (
                <button
                  key={f.label}
                  style={{
                    ...dropdownItemStyle,
                    background: i === amountIdx ? 'var(--kiima-olive)' : 'transparent',
                    fontWeight: i === amountIdx ? 700 : 500,
                  }}
                  onClick={() => { setAmountIdx(i); setFilterOpen(false); }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      <div style={cardStyle}>
        {filtered.length === 0 ? (
          <p style={emptyStyle}>
            {contributions.length === 0
              ? 'No gifts yet — share your link to get started ✨'
              : 'No gifts match your search or filter.'}
          </p>
        ) : (
          <>
            <p style={countStyle}>
              {filtered.length} of {contributions.length} contribution{contributions.length !== 1 ? 's' : ''}
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {filtered.map((contribution, index) => {
                const source = contribution.pool ? contribution.pool.title : 'Direct gift';
                return (
                  <ContributionRow
                    key={contribution.id}
                    contribution={contribution}
                    source={source}
                    isLast={index === filtered.length - 1}
                  />
                );
              })}
            </ul>
          </>
        )}
      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const toolbarStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  marginBottom: 20,
  flexWrap: 'wrap',
};

const searchWrapStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 200,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  background: 'var(--color-surface)',
  border: '2px solid #000000',
  padding: '0 14px',
  boxShadow: '3px 3px 0 0 #000000',
};

const searchInputStyle: React.CSSProperties = {
  flex: 1,
  border: 'none',
  background: 'transparent',
  boxShadow: 'none',
  padding: '10px 0',
  outline: 'none',
  fontSize: 14,
  fontFamily: 'var(--kiima-font)',
  color: 'var(--color-text-primary)',
};

const filterBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  height: 46,
  padding: '0 18px',
  border: '2px solid #000000',
  background: 'var(--color-surface)',
  fontFamily: 'var(--kiima-font)',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
  boxShadow: '3px 3px 0 0 #000000',
  whiteSpace: 'nowrap',
  transition: 'transform 0.15s ease',
};

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  right: 0,
  background: 'var(--color-surface)',
  border: '2px solid #000000',
  boxShadow: '4px 4px 0 0 #000000',
  minWidth: 160,
  zIndex: 20,
  display: 'flex',
  flexDirection: 'column',
};

const dropdownItemStyle: React.CSSProperties = {
  padding: '10px 16px',
  fontFamily: 'var(--kiima-font)',
  fontSize: 14,
  color: 'var(--color-text-primary)',
  cursor: 'pointer',
  border: 'none',
  textAlign: 'left',
  transition: 'background 0.1s ease',
};

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--shadow-card)',
  padding: 'var(--space-xl)',
};

const countStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontWeight: 700,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--color-text-faint)',
  margin: '0 0 var(--space-md)',
};

const emptyStyle: React.CSSProperties = {
  fontFamily: 'var(--kiima-font)',
  fontSize: 14,
  color: 'var(--color-text-muted)',
  margin: 0,
  padding: 'var(--space-md) 0',
};
