'use client';

import { useEffect } from 'react';

interface Props {
  url: string;
  twitterEmbedHtml?: string | null;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([^?&\s#]+)/
  );
  return match?.[1] ?? null;
}

function getSpotifyEmbed(url: string): string | null {
  const match = url.match(
    /open\.spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/
  );
  if (match) return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
  return null;
}

function isTwitter(url: string): boolean {
  return url.includes('twitter.com') || url.includes('x.com');
}

function TwitterEmbed({ html }: { html: string }) {
  useEffect(() => {
    const win = window as typeof window & { twttr?: { widgets?: { load?: () => void } } };
    if (win.twttr?.widgets?.load) {
      win.twttr.widgets.load();
      return;
    }
    if (!document.getElementById('twitter-widgets-script')) {
      const script = document.createElement('script');
      script.id = 'twitter-widgets-script';
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.charset = 'utf-8';
      document.body.appendChild(script);
    }
  }, [html]);

  return (
    <div
      style={twitterEmbedWrapStyle}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function TwitterCard({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={twitterCardStyle}
      className="k-creator-link-card"
    >
      <div style={twitterIconStyle}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={twitterLabelStyle}>View on X (Twitter)</p>
        <p style={twitterUrlStyle}>{url}</p>
      </div>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
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

export default function EmbedBlock({ url, twitterEmbedHtml }: Props) {
  if (!url) return null;

  const ytId = getYouTubeId(url);
  if (ytId) {
    return (
      <div style={youtubeWrapperStyle}>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            title="YouTube video"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  const spotifyEmbedUrl = getSpotifyEmbed(url);
  if (spotifyEmbedUrl) {
    return (
      <div style={spotifyWrapperStyle}>
        <iframe
          src={spotifyEmbedUrl}
          width="100%"
          height="152"
          title="Spotify embed"
          style={{ border: 'none', display: 'block' }}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </div>
    );
  }

  if (isTwitter(url)) {
    if (twitterEmbedHtml) {
      return <TwitterEmbed html={twitterEmbedHtml} />;
    }
    return <TwitterCard url={url} />;
  }

  return null;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const youtubeWrapperStyle: React.CSSProperties = {
  borderRadius: 20,
  overflow: 'hidden',
  background: '#000000',
};

const spotifyWrapperStyle: React.CSSProperties = {
  borderRadius: 20,
  overflow: 'hidden',
};

const twitterEmbedWrapStyle: React.CSSProperties = {
  borderRadius: 20,
  overflow: 'hidden',
  background: '#ffffff',
  colorScheme: 'light',
};

const twitterCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  background: '#ffffff',
  borderRadius: 20,
  border: '1px solid rgba(0,0,0,0.07)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.05)',
  padding: '16px 18px',
  textDecoration: 'none',
  cursor: 'pointer',
  colorScheme: 'light',
};

const twitterIconStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 10,
  background: '#000000',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const twitterLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: 15,
  color: '#1C1916',
  margin: 0,
};

const twitterUrlStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 12,
  color: '#9A9089',
  margin: '3px 0 0',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};
