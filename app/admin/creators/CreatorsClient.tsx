'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ProfileWithAdmin } from '@/types';

interface Props {
  creators: (ProfileWithAdmin & { total_received: number })[];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  fontFamily: 'var(--font-body)',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--color-text-faint)',
  textAlign: 'left',
  background: 'var(--color-bg)',
  borderBottom: '1px solid var(--color-border)',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-primary)',
  borderBottom: '1px solid var(--color-border)',
  verticalAlign: 'middle',
};

export default function CreatorsClient({ creators }: Props) {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? creators.filter((c) => {
        const q = query.toLowerCase();
        return (
          c.display_name.toLowerCase().includes(q) ||
          c.username.toLowerCase().includes(q)
        );
      })
    : creators;

  return (
    <div>
      {/* Search */}
      <input
        type="text"
        placeholder="Search by name or username…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
          outline: 'none',
          width: '100%',
          maxWidth: 360,
          marginBottom: 20,
          boxSizing: 'border-box',
        }}
      />

      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
        }}
      >
        {filtered.length === 0 ? (
          <div
            style={{
              padding: '40px 24px',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
            }}
          >
            No creators found.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Creator</th>
                <th style={thStyle}>Currency</th>
                <th style={thStyle}>Joined</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((creator, i) => {
                const isLast = i === filtered.length - 1;
                const rowTd: React.CSSProperties = isLast
                  ? { ...tdStyle, borderBottom: 'none' }
                  : tdStyle;
                return (
                  <tr key={creator.id}>
                    <td style={rowTd}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {creator.display_name}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--color-text-muted)',
                          marginTop: 2,
                        }}
                      >
                        @{creator.username}
                      </div>
                    </td>
                    <td style={rowTd}>{creator.currency}</td>
                    <td style={{ ...rowTd, color: 'var(--color-text-secondary)' }}>
                      {formatDate(creator.created_at)}
                    </td>
                    <td style={rowTd}>
                      {creator.suspended ? (
                        <span
                          style={{
                            background: 'var(--color-danger-soft)',
                            color: 'var(--color-danger)',
                            fontFamily: 'var(--font-body)',
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                          }}
                        >
                          Suspended
                        </span>
                      ) : (
                        <span
                          style={{
                            background: 'var(--color-success-soft)',
                            color: 'var(--color-success)',
                            fontFamily: 'var(--font-body)',
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                          }}
                        >
                          Active
                        </span>
                      )}
                    </td>
                    <td style={{ ...rowTd, textAlign: 'right' }}>
                      <Link
                        href={`/admin/creators/${creator.id}`}
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'var(--color-accent)',
                          textDecoration: 'none',
                        }}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div
        style={{
          marginTop: 12,
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'var(--color-text-muted)',
        }}
      >
        {filtered.length} of {creators.length} creators
      </div>
    </div>
  );
}
