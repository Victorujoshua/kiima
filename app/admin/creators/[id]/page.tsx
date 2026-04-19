import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatCurrency } from '@/lib/utils/currency';
import { resolveDisplayName } from '@/lib/utils/display-name';
import SuspendButton from './SuspendButton';
import type { Currency } from '@/types';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '16px',
  fontWeight: 600,
  color: 'var(--color-text-primary)',
  margin: '0 0 16px',
};

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--shadow-card)',
  padding: '24px',
  marginBottom: 20,
};

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
};

const tdStyle: React.CSSProperties = {
  padding: '11px 16px',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-primary)',
  borderBottom: '1px solid var(--color-border)',
  verticalAlign: 'middle',
};

const tdLast: React.CSSProperties = { ...tdStyle, borderBottom: 'none' };

export default async function AdminCreatorDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const admin = createAdminClient();

  const [
    { data: creator },
    { data: tags },
    { data: pools },
    { data: contributions },
  ] = await Promise.all([
    admin
      .from('profiles')
      .select('id, username, display_name, bio, avatar_url, currency, is_admin, suspended, created_at')
      .eq('id', params.id)
      .single(),
    admin
      .from('gift_tags')
      .select('id, label, amount, is_default, created_at')
      .eq('user_id', params.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true }),
    admin
      .from('support_pools')
      .select('id, title, status, goal_amount, raised, slug, created_at')
      .eq('user_id', params.id)
      .order('created_at', { ascending: false }),
    admin
      .from('contributions')
      .select('id, gift_amount, kiima_fee, creator_amount, currency, display_name, is_anonymous, paystack_ref, status, created_at, pool_id')
      .eq('recipient_id', params.id)
      .order('created_at', { ascending: false })
      .limit(30),
  ]);

  if (!creator) notFound();

  const currency = creator.currency as Currency;

  return (
    <div style={{ padding: '40px 48px', maxWidth: 980, margin: '0 auto' }}>
      {/* Back link */}
      <a
        href="/admin/creators"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'var(--color-text-muted)',
          textDecoration: 'none',
          display: 'inline-block',
          marginBottom: 20,
        }}
      >
        ← All creators
      </a>

      {/* Profile card */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '24px',
                  fontWeight: 500,
                  color: 'var(--color-text-primary)',
                  margin: 0,
                }}
              >
                {creator.display_name}
              </h1>
              {creator.suspended && (
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
              )}
              {creator.is_admin && (
                <span
                  style={{
                    background: 'var(--color-accent-soft)',
                    color: 'var(--color-accent)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  Admin
                </span>
              )}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--color-text-muted)',
                marginBottom: 4,
              }}
            >
              @{creator.username} · {currency} · Joined {formatDate(creator.created_at)}
            </div>
            {creator.bio && (
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: 'var(--color-text-secondary)',
                  marginTop: 8,
                }}
              >
                {creator.bio}
              </div>
            )}
          </div>
          <div>
            <SuspendButton creatorId={creator.id} isSuspended={creator.suspended} />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div style={cardStyle}>
        <h2 style={sectionHeadingStyle}>Gift Tags ({tags?.length ?? 0})</h2>
        {!tags || tags.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text-muted)', margin: 0 }}>
            No tags.
          </p>
        ) : (
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Label</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Created</th>
                </tr>
              </thead>
              <tbody>
                {tags.map((tag, i) => {
                  const isLast = i === tags.length - 1;
                  const td = isLast ? tdLast : tdStyle;
                  return (
                    <tr key={tag.id}>
                      <td style={td}>{tag.label}</td>
                      <td style={td}>{formatCurrency(tag.amount, currency)}</td>
                      <td style={td}>
                        {tag.is_default ? (
                          <span style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '2px 7px', borderRadius: 'var(--radius-full)' }}>
                            System
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontSize: '13px' }}>Custom</span>
                        )}
                      </td>
                      <td style={{ ...td, color: 'var(--color-text-muted)' }}>{formatDate(tag.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pools */}
      <div style={cardStyle}>
        <h2 style={sectionHeadingStyle}>Support Pools ({pools?.length ?? 0})</h2>
        {!pools || pools.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text-muted)', margin: 0 }}>
            No pools.
          </p>
        ) : (
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Goal</th>
                  <th style={thStyle}>Raised</th>
                  <th style={thStyle}>Created</th>
                </tr>
              </thead>
              <tbody>
                {pools.map((pool, i) => {
                  const isLast = i === pools.length - 1;
                  const td = isLast ? tdLast : tdStyle;
                  const pct = pool.goal_amount > 0 ? Math.min(100, Math.round((pool.raised / pool.goal_amount) * 100)) : 0;
                  return (
                    <tr key={pool.id}>
                      <td style={td}>
                        <a
                          href={`/${creator.username}/pool/${pool.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}
                        >
                          {pool.title}
                        </a>
                      </td>
                      <td style={td}>
                        <span style={{
                          background: pool.status === 'open' ? 'var(--color-success-soft)' : 'var(--color-bg)',
                          color: pool.status === 'open' ? 'var(--color-success)' : 'var(--color-text-muted)',
                          fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: '0.08em',
                          padding: '2px 7px', borderRadius: 'var(--radius-full)',
                        }}>
                          {pool.status}
                        </span>
                      </td>
                      <td style={td}>{formatCurrency(pool.goal_amount, currency)}</td>
                      <td style={td}>{formatCurrency(pool.raised, currency)} <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>({pct}%)</span></td>
                      <td style={{ ...td, color: 'var(--color-text-muted)' }}>{formatDate(pool.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent contributions received */}
      <div style={cardStyle}>
        <h2 style={sectionHeadingStyle}>Recent Contributions Received ({contributions?.length ?? 0})</h2>
        {!contributions || contributions.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text-muted)', margin: 0 }}>
            No contributions yet.
          </p>
        ) : (
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Gifter</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Fee</th>
                  <th style={thStyle}>Net</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Paystack Ref</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((c, i) => {
                  const isLast = i === contributions.length - 1;
                  const td = isLast ? tdLast : tdStyle;
                  // Admin never reveals anonymous identity — Section 15.6
                  const gifterName = resolveDisplayName(c.display_name, c.is_anonymous);
                  return (
                    <tr key={c.id} style={{ opacity: c.status === 'pending' ? 0.65 : 1 }}>
                      <td style={{ ...td, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{formatDate(c.created_at)}</td>
                      <td style={td}>{gifterName}</td>
                      <td style={{ ...td, fontWeight: 600 }}>{formatCurrency(c.gift_amount, c.currency as Currency)}</td>
                      <td style={{ ...td, color: 'var(--color-text-muted)' }}>{formatCurrency(c.kiima_fee, c.currency as Currency)}</td>
                      <td style={{ ...td, color: 'var(--color-success)', fontWeight: 600 }}>{formatCurrency(c.creator_amount, c.currency as Currency)}</td>
                      <td style={td}>
                        <span style={{
                          background: c.status === 'confirmed' ? 'var(--color-success-soft)' : 'var(--color-bg)',
                          color: c.status === 'confirmed' ? 'var(--color-success)' : 'var(--color-text-muted)',
                          fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: '0.08em',
                          padding: '2px 7px', borderRadius: 'var(--radius-full)',
                        }}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ ...td, fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {c.paystack_ref}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
