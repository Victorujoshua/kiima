'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils/currency';
import type { Currency } from '@/types';

interface ProgressBarProps {
  raised: number;
  goal: number;
  currency: Currency;
}

export default function ProgressBar({ raised, goal, currency }: ProgressBarProps) {
  const targetPct = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
  const pctDisplay = Math.round(targetPct);

  // Start at 0 and animate to target on mount
  const [widthPct, setWidthPct] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setWidthPct(targetPct), 60);
    return () => clearTimeout(id);
  }, [targetPct]);

  return (
    <div>
      {/* Track */}
      <div style={trackStyle}>
        <div style={{ ...fillStyle, width: `${widthPct}%` }} />
      </div>

      {/* Labels */}
      <div style={labelsStyle}>
        <span style={raisedStyle}>{formatCurrency(raised, currency)} raised</span>
        <span style={goalStyle}>
          {pctDisplay}% of {formatCurrency(goal, currency)}
        </span>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const trackStyle: React.CSSProperties = {
  width: '100%',
  height: '8px',
  background: 'var(--color-accent-soft)',
  borderRadius: 'var(--radius-full)',
  overflow: 'hidden',
};

const fillStyle: React.CSSProperties = {
  height: '100%',
  background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent-light))',
  borderRadius: 'var(--radius-full)',
  transition: 'width 0.6s ease',
  minWidth: '0px',
};

const labelsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: 'var(--space-xs)',
};

const raisedStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '13px',
  color: 'var(--color-text-primary)',
};

const goalStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  color: 'var(--color-text-muted)',
};
