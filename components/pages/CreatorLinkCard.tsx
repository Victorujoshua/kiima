import type { CreatorLink } from '@/types';

interface Props {
  link: CreatorLink;
}

export default function CreatorLinkCard({ link }: Props) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="k-creator-link-card"
    >
      {link.thumbnail_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={link.thumbnail_url}
          alt=""
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            objectFit: 'cover',
            flexShrink: 0,
            display: 'block',
          }}
        />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          fontSize: 15,
          color: '#1C1916',
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {link.title}
        </p>
        {link.description && (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: '#9A9089',
            margin: '3px 0 0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {link.description}
          </p>
        )}
      </div>

      <div
        aria-hidden="true"
        style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M4 9h10M10 5l4 4-4 4"
            stroke="#B5AAAA"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </a>
  );
}
