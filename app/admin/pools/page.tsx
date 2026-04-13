import { createAdminClient } from '@/lib/supabase/admin';
import { formatCurrency } from '@/lib/utils/currency';
import ForceCloseButton from './ForceCloseButton';
import type { Currency } from '@/types';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const thStyle: React.CSSProperties = {
  padding: '10px 14px',
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
  padding: '11px 14px',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--color-text-primary)',
  borderBottom: '1px solid var(--color-border)',
  verticalAlign: 'middle',
};

export default async function AdminPoolsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const admin = createAdminClient();
  const statusFilter = searchParams.status === 'open' ? 'open' : searchParams.status === 'closed' ? 'closed' : null;

  let query = admin
    .from('support_pools')
    .select(
      'id, title, slug, goal_amount, raised, status, created_at, user_id, profiles!user_id(display_name, username)'
    )
    .order('created_at', { ascending: false })
    .limit(200);

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data: pools } = await query;

  // Get contributor counts in a second query
  const poolIds = (pools ?? []).map((p) => p.id);
  const { data: countRows } = poolIds.length > 0
    ? await admin
        .from('contributions')
        .select('pool_id')
        .in('pool_id', poolIds)
        .eq('status', 'confirmed')
    : { data: [] };

  const countMap: Record<string, number> = {};
  for (const row of countRows ?? []) {
    if (row.pool_id) countMap[row.pool_id] = (countMap[row.pool_id] ?? 0) + 1;
  }

  return (
    <div style={{ padding: '40px 48px', maxWidth: 1200, margin: '0 auto' }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '26px',
          fontWeight: 500,
          color: 'var(--color-text-primary)',
          margin: '0 0 8px',
        }}
      >
        Pools
      </h1>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[
          { label: 'All', value: null },
          { label: 'Open', value: 'open' },
          { label: 'Closed', value: 'closed' },
        ].map(({ label, value }) => {
          const isActive = statusFilter === value;
          const href = value ? `/admin/pools?status=${value}` : '/admin/pools';
          return (
            <a
              key={label}
              href={href}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                padding: '7px 14px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid',
                borderColor: isActive ? 'var(--color-text-primary)' : 'var(--color-border)',
                background: isActive ? 'var(--color-text-primary)' : 'var(--color-surface)',
                color: isActive ? '#fff' : 'var(--color-text-secondary)',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {label}
            </a>
          );
        })}
      </div>

      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'auto',
        }}
      >
        {!pools || pools.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text-muted)' }}>
            No pools found.
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Creator</th>
                  <th style={thStyle}>Goal</th>
                  <th style={thStyle}>Raised</th>
                  <th style={thStyle}>%</th>
                  <th style={thStyle}>Contributors</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Created</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {pools.map((pool, i) => {
                  const isLast = i === pools.length - 1;
                  const td: React.CSSProperties = isLast ? { ...tdStyle, borderBottom: 'none' } : tdStyle;
                  const creator = (pool as Record<string, unknown>).profiles as { display_name: string; username: string } | null;
                  const pct = pool.goal_amount > 0 ? Math.min(100, Math.round((pool.raised / pool.goal_amount) * 100)) : 0;
                  const contributorCount = countMap[pool.id] ?? 0;
                  // We don't have currency on pool — fetch from creator's profile currency
                  // For display here, show raw numbers with currency from pool if available
                  // Since we don't join currency, we'll use a simple number format
                  const isOpen = pool.status === 'open';

                  return (
                    <tr key={pool.id}>
                      <td style={{ ...td, maxWidth: 200 }}>
                        <a
                          href={creator ? `/${creator.username}/pool/${pool.slug}` : '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}
                        >
                          {pool.title}
                        </a>
                      </td>
                      <td style={td}>
                        {creator ? (
                          <a
                            href={`/admin/creators/${pool.user_id}`}
                            style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '12px' }}
                          >
                            @{creator.username}
                          </a>
                        ) : '—'}
                      </td>
                      <td style={{ ...td, color: 'var(--color-text-secondary)' }}>
                        {pool.goal_amount.toLocaleString('en')}
                      </td>
                      <td style={{ ...td, fontWeight: 600 }}>
                        {pool.raised.toLocaleString('en')}
                      </td>
                      <td style={{ ...td, color: pct >= 100 ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                        {pct}%
                      </td>
                      <td style={{ ...td, color: 'var(--color-text-muted)' }}>{contributorCount}</td>
                      <td style={td}>
                        <span style={{
                          background: isOpen ? 'var(--color-success-soft)' : 'rgba(28,25,22,0.05)',
                          color: isOpen ? 'var(--color-success)' : 'var(--color-text-muted)',
                          fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: '0.08em',
                          padding: '2px 7px', borderRadius: 'var(--radius-full)',
                        }}>
                          {pool.status}
                        </span>
                      </td>
                      <td style={{ ...td, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                        {formatDate(pool.created_at)}
                      </td>
                      <td style={{ ...td, minWidth: 120 }}>
                        {isOpen && <ForceCloseButton poolId={pool.id} />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Showing {pools.length} pool{pools.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
