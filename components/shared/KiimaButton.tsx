'use client';

import React from 'react';

type Variant = 'light' | 'dark' | 'primary' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg' | 'xl';

interface KiimaButtonProps {
  variant?:   Variant;
  size?:      Size;
  children:   React.ReactNode;
  onClick?:   () => void;
  type?:      'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  className?: string;
  disabled?:  boolean;
  loading?:   boolean;
}

const HEART_PATH =
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 " +
  "3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 " +
  "3.78-3.4 6.86-8.55 11.54L12 21.35z";

const SIZE_MAP: Record<Size, { px: string; py: string; text: string; heart: number; bleedPx: number }> = {
  sm: { px: 'px-5',       py: 'py-[10px]',  text: 'text-[13px]', heart: 13, bleedPx: 4 },
  md: { px: 'px-[26px]',  py: 'py-[13px]',  text: 'text-[15px]', heart: 17, bleedPx: 5 },
  lg: { px: 'px-9',       py: 'py-[17px]',  text: 'text-[18px]', heart: 20, bleedPx: 6 },
  xl: { px: 'px-12',      py: 'py-[21px]',  text: 'text-[22px]', heart: 24, bleedPx: 7 },
};

function resolveColors(variant: Variant): { face: string; shadow: string } {
  switch (variant) {
    case 'dark':
      return { face: '#FF5C00', shadow: '#D7D744' };
    case 'danger':
      return { face: '#E07070', shadow: '#000000' };
    case 'ghost':
      return { face: 'transparent', shadow: 'transparent' };
    default: // 'light' | 'primary'
      return { face: '#D7D744', shadow: '#FF5C00' };
  }
}

export default function KiimaButton({
  variant   = 'light',
  size      = 'md',
  children,
  onClick,
  type      = 'button',
  fullWidth = false,
  className = '',
  disabled  = false,
  loading   = false,
}: KiimaButtonProps) {
  const s = SIZE_MAP[size];
  const isDisabled = disabled || loading;
  const { face, shadow } = resolveColors(variant);
  const isGhost = variant === 'ghost';

  const wrapperClasses = [
    'kiima-btn-group',
    'relative',
    'group',
    fullWidth ? 'flex' : 'inline-flex',
    className,
  ].filter(Boolean).join(' ');

  const faceClasses = [
    'relative',
    'inline-flex',
    'items-center',
    'justify-center',
    'gap-2',
    'border-2',
    'border-black',
    'font-bold',
    'text-black',
    'transition-transform',
    'duration-[220ms]',
    'ease-in-out',
    !isDisabled ? 'group-hover:-translate-x-[5px]' : '',
    !isDisabled ? 'group-hover:-translate-y-[5px]' : '',
    !isDisabled ? 'active:-translate-x-[2px]'      : '',
    !isDisabled ? 'active:-translate-y-[2px]'       : '',
    isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
    s.px,
    s.py,
    s.text,
    fullWidth ? 'flex-1' : '',
  ].filter(Boolean).join(' ');

  return (
    <span
      className={wrapperClasses}
      style={{ paddingRight: s.bleedPx, paddingBottom: s.bleedPx }}
    >
      {/* Shadow layer — offset backdrop */}
      {!isGhost && (
        <span
          className="absolute bottom-0 right-0 w-full h-full border-2 border-black"
          style={{ background: shadow }}
          aria-hidden="true"
        />
      )}

      {/* Face button */}
      <button
        type={type}
        onClick={onClick}
        disabled={isDisabled}
        className={faceClasses}
        style={{ background: face }}
      >
        {loading ? (
          <>
            <span className="k-spinner" aria-hidden="true" />
            Just a moment…
          </>
        ) : (
          <>
            <svg
              className="heart"
              width={s.heart}
              height={s.heart}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              style={{ flexShrink: 0 }}
            >
              <path d={HEART_PATH} />
            </svg>
            {children}
          </>
        )}
      </button>
    </span>
  );
}
