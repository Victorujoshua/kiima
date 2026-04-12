'use client';

interface KiimaButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'ghost' | 'danger';
  fullWidth?: boolean;
}

export default function KiimaButton({
  children,
  onClick,
  loading = false,
  disabled = false,
  type = 'button',
  variant = 'primary',
  fullWidth = false,
}: KiimaButtonProps) {
  const variantClass =
    variant === 'ghost'
      ? 'k-btn--ghost'
      : variant === 'danger'
      ? 'k-btn--danger'
      : 'k-btn--primary';

  const classes = ['k-btn', variantClass, fullWidth ? 'k-btn--full' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
    >
      {loading ? (
        <>
          <span className="k-spinner" aria-hidden="true" />
          Just a moment…
        </>
      ) : (
        children
      )}
    </button>
  );
}
