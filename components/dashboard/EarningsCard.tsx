'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils/currency';
import type { Currency } from '@/types';

type Period = '7d' | '30d' | 'all';

interface ContributionItem {
  gift_amount: number;
  pool_id:     string | null;
  created_at:  string;
}

interface Props {
  contributions: ContributionItem[];
  currency:      Currency;
}

const PERIOD_MS: Record<Period, number | null> = {
  '7d':  7  * 86_400_000,
  '30d': 30 * 86_400_000,
  'all': null,
};

export default function EarningsCard({ contributions, currency }: Props) {
  const [period, setPeriod] = useState<Period>('30d');

  const now     = Date.now();
  const cutoff  = PERIOD_MS[period];
  const filtered = contributions.filter(c =>
    cutoff === null ? true : (now - new Date(c.created_at).getTime()) < cutoff
  );

  const directTotal = filtered.filter(c => !c.pool_id).reduce((s, c) => s + Number(c.gift_amount), 0);
  const poolTotal   = filtered.filter(c =>  c.pool_id).reduce((s, c) => s + Number(c.gift_amount), 0);
  const grandTotal  = directTotal + poolTotal;

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={headerRowStyle}>
        <span style={headingStyle}>Earnings</span>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value as Period)}
          style={periodSelectStyle}
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Big number */}
      <p style={bigAmountStyle}>
        {formatCurrency(grandTotal, currency)}
      </p>

      {/* Breakdown */}
      <div style={breakdownRowStyle}>
        <div style={breakdownItemStyle}>
          <span style={{ ...dotStyle, background: '#D7D744' }} />
          <span style={breakdownAmountStyle}>{formatCurrency(directTotal, currency)}</span>
          <span style={breakdownLabelStyle}>Gifts</span>
        </div>
        <div style={breakdownItemStyle}>
          <span style={{ ...dotStyle, background: '#FF5C00' }} />
          <span style={breakdownAmountStyle}>{formatCurrency(poolTotal, currency)}</span>
          <span style={breakdownLabelStyle}>Pools</span>
        </div>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background:   '#ffffff',
  borderRadius: 16,
  border:       '1px solid #EBEBEB',
  padding:      28,
  marginTop:    16,
};

const headerRowStyle: React.CSSProperties = {
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'space-between',
  marginBottom:   20,
};

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize:   18,
  color:      '#1C1916',
};

const periodSelectStyle: React.CSSProperties = {
  fontFamily:   'var(--font-body)',
  fontSize:     13,
  color:        '#5A4D44',
  border:       '1px solid #E5DED8',
  borderRadius: 100,
  padding:      '6px 14px',
  background:   '#ffffff',
  cursor:       'pointer',
  outline:      'none',
  appearance:   'none',
  paddingRight: 28,
};

const bigAmountStyle: React.CSSProperties = {
  fontFamily:  'var(--font-display)',
  fontWeight:  600,
  fontSize:    48,
  color:       '#1C1916',
  margin:      '0 0 20px',
  lineHeight:  1,
  letterSpacing: '-1px',
};

const breakdownRowStyle: React.CSSProperties = {
  display: 'flex',
  gap:     24,
  flexWrap: 'wrap',
};

const breakdownItemStyle: React.CSSProperties = {
  display:    'flex',
  alignItems: 'center',
  gap:        6,
};

const dotStyle: React.CSSProperties = {
  width:        8,
  height:       8,
  borderRadius: '50%',
  flexShrink:   0,
  display:      'inline-block',
};

const breakdownAmountStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize:   13,
  color:      '#1C1916',
};

const breakdownLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize:   13,
  color:      '#9A9089',
};
