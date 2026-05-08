'use client';

import { useEffect, useRef } from 'react';

interface Props {
  url: string;
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

function TwitterEmbed({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const blockquote = document.createElement('blockquote');
    blockquote.className = 'twitter-tweet';
    blockquote.setAttribute('data-dnt', 'true');
    const anchor = document.createElement('a');
    anchor.href = url;
    blockquote.appendChild(anchor);
    container.appendChild(blockquote);

    const win = window as unknown as { twttr?: { widgets: { load: (el: HTMLElement) => void } } };
    if (win.twttr?.widgets) {
      win.twttr.widgets.load(container);
    } else {
      const existing = document.querySelector('script[src*="platform.twitter.com/widgets.js"]');
      if (!existing) {
        const script = document.createElement('script');
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        script.charset = 'utf-8';
        document.head.appendChild(script);
      }
    }

    return () => {
      container.innerHTML = '';
    };
  }, [url]);

  return <div ref={ref} style={{ minHeight: 200 }} />;
}

export default function EmbedBlock({ url }: Props) {
  if (!url) return null;

  const ytId = getYouTubeId(url);
  if (ytId) {
    return (
      <div style={wrapperStyle}>
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
      <div style={wrapperStyle}>
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
    return (
      <div style={wrapperStyle}>
        <TwitterEmbed url={url} />
      </div>
    );
  }

  return null;
}

const wrapperStyle: React.CSSProperties = {
  borderRadius: 20,
  overflow: 'hidden',
  background: '#ffffff',
  border: '1px solid rgba(0,0,0,0.07)',
};
