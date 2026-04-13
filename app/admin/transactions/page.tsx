import { createAdminClient } from '@/lib/supabase/admin';
import { formatCurrency } from '@/lib/utils/currency';
import { resolveDisplayName } from '@/lib/utils/display-name';
import RecheckButton from './RecheckButton';
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

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const admin = createAdminClient();
  const statusFilter = searchParams.status === 'pending' ? 'pending' : searchParams.status === 'confirmed' ? 'confirmed' : null;

  let query = admin
    .from('contributions')
    .select(
      'id, amount, fee, net_amount, currency, display_name, is_anonymous, paystack_ref, status, created_at, pool_id, recipient_id, tag_id, profiles!recipient_id(display_name, username), support_pools!pool_id(title, slug)'
    )
    .order('created_at', { ascending: false })
    .limit(200);

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data: contributions } = await query;

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
        Transactions
      </h1>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[
          { label: 'All', value: null },
          { label: 'Confirmed', value: 'confirmed' },
          { label: 'Pending', value: 'pending' },
        ].map(({ label, value }) => {
          const isActive = statusFilter === value;
          const href = value ? `/admin/transactions?status=${value}` : '/admin/transactions';
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
        {!contributions || contributions.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text-muted)' }}>
            No transactions found.
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Creator</th>
                  <th style={thStyle}>Gifter</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Fee</th>
                  <th style={thStyle}>Net</th>
                  <th style={thStyle}>Pool</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Paystack Ref</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((c, i) => {
                  const isLast = i === contributions.length - 1;
                  const td: React.CSSProperties = isLast ? { ...tdStyle, borderBottom: 'none' } : tdStyle;
                  // Admin never reveals anonymous identity — Section 15.6
                  const gifterName = resolveDisplayName(c.display_name, c.is_anonymous);
                  const creator = (c as Record<string, unknown>).profiles as { display_name: string; username: string } | null;
                  const pool = (c as Record<string, unknown>).support_pools as { title: string; slug: string } | null;
                  const isPending = c.status === 'pending';
                  const rowStyle: React.CSSProperties = isPending ? { opacity: 0.75, background: 'var(--color-bg)' } : {};

                  return (
                    <tr key={c.id} style={rowStyle}>
                      <td style={{ ...td, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{formatDate(c.created_at)}</td>
                      <td style={td}>
                        {creator ? (
                          <a
                            href={`/admin/creators/${c.recipient_id}`}
                            style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600, fontSize: '13px' }}
                          >
                            @{creator.username}
                          </a>
                        ) : '—'}
                      </td>
                      <td style={{ ...td, color: 'var(--color-text-secondary)' }}>{gifterName}</td>
                      <td style={{ ...td, fontWeight: 600 }}>{formatCurrency(c.amount, c.currency as Currency)}</td>
                      <td style={{ ...td, color: 'var(--color-text-muted)', fontSize: '12px' }}>{formatCurrency(c.fee, c.currency as Currency)}</td>
                      <td style={{ ...td, color: 'var(--color-success)', fontWeight: 600 }}>{formatCurrency(c.net_amount, c.currency as Currency)}</td>
                      <td style={{ ...td, color: 'var(--color-text-muted)', fontSize: '12px' }}>
                        {pool ? pool.title : '—'}
                      </td>
                      <td style={td}>
                        <span style={{
                          background: isPending ? 'rgba(28,25,22,0.05)' : 'var(--color-success-soft)',
                          color: isPending ? 'var(--color-text-muted)' : 'var(--color-success)',
                          fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: '0.08em',
                          padding: '2px 7px', borderRadius: 'var(--radius-full)',
                        }}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ ...td, fontFamily: 'monospace', fontSize: '11px', color: 'var(--color-text-muted)', maxWidth: 160 }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.paystack_ref}
                        </span>
                      </td>
                      <td style={{ ...td, minWidth: 90 }}>
                        {isPending && <RecheckButton paystackRef={c.paystack_ref} />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Showing {contributions.length} contribution{contributions.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
