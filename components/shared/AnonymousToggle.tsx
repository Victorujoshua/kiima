'use client';

interface AnonymousToggleProps {
  isAnon: boolean;
  displayName?: string;
  onChange: (value: boolean) => void;
}

export default function AnonymousToggle({
  isAnon,
  displayName,
  onChange,
}: AnonymousToggleProps) {
  // Section 4.3 Rule 4: Toggle OFF + no name → "your name" as fallback copy
  const previewName = isAnon
    ? 'Anonymous'
    : displayName?.trim() || 'your name';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
      {/* Toggle row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-md)',
        }}
      >
        <span style={labelStyle}>Give anonymously</span>

        {/* Outer button has transparent padding to reach 44px tap target */}
        <button
          type="button"
          role="switch"
          aria-checked={isAnon}
          aria-label="Toggle anonymous"
          onClick={() => onChange(!isAnon)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '10px 0',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          {/* Visual track */}
          <span
            style={{
              width: '44px',
              height: '24px',
              borderRadius: 'var(--radius-full)',
              padding: '2px',
              background: isAnon ? 'var(--color-accent)' : 'rgba(28, 25, 22, 0.14)',
              transition: 'background 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isAnon ? 'flex-end' : 'flex-start',
            }}
          >
            {/* Thumb */}
            <span
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#ffffff',
                boxShadow: '0 1px 4px rgba(28, 25, 22, 0.20)',
                display: 'block',
                flexShrink: 0,
              }}
            />
          </span>
        </button>
      </div>

      {/* Identity preview — Section 4.3 Rule 4 */}
      <p style={previewStyle}>
        👤 You'll appear as{' '}
        <strong
          style={{
            color: isAnon ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
            fontWeight: 600,
          }}
        >
          {previewName}
        </strong>
      </p>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--color-text-faint)',
};

const previewStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--color-text-secondary)',
  margin: 0,
  lineHeight: 1.5,
};
