'use client';

import { formatCurrency } from '@/lib/utils/currency';
import type { GiftTag } from '@/types';

interface GiftTagPillProps {
  tag: GiftTag;
  selected: boolean;
  onSelect: (tag: GiftTag | null) => void;
  currency: string;
}

export default function GiftTagPill({ tag, selected, onSelect, currency }: GiftTagPillProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(selected ? null : tag)}
      aria-pressed={selected}
      className={`k-tag-pill${selected ? ' k-tag-pill--selected' : ''}`}
    >
      {tag.label} · {formatCurrency(tag.amount, currency)}
    </button>
  );
}
