import { createAdminClient } from '@/lib/supabase/admin';
import { formatCurrency } from '@/lib/utils/currency';
import AdminStatCard from '@/components/cards/AdminStatCard';
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
};

export default async function AdminPage() {
  const admin = createAdminClient();

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

  const [
    { count: totalCreators },
    { count: newCreatorsCount },
    { count: totalContributions },
    { count: activePools },
    { data: confirmedAmounts },
    { data: recentCreators },
    { data: stuckPending },
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo),
    admin
      .from('contributions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'confirmed'),
    admin
      .from('support_pools')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open'),
    admin
      .from('contributions')
      .select('amount, currency')
      .eq('status', 'confirmed'),
    admin
      .from('profiles')
      .select('id, display_name, username, currency, created_at')
      .gte('created_at', weekAgo)
      .order('created_at', { ascending: false }),
    admin
      .from('contributions')
      .select('id, amount, currency, paystack_ref')
      .eq('status', 'pending')
      .lt('created_at', hourAgo),
  ]);

  // Sum confirmed volume by currency
  const volumeByCurrency: Partial<Record<Currency, number>> = {};
  for (const row of confirmedAmounts ?? []) {
    const c = row.currency as Currency;
    volumeByCurrency[c] = (volumeByCurrency[c] ?? 0) + row.amount;
  }
  const currencies = Object.keys(volumeByCurrency) as Currency[];

  return (
    <div style={{ padding: '40px 48px', maxWidth: 980, margin: '0 auto' }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '26px',
          fontWeight: 500,
          color: 'var(--color-text-primary)',
          margin: '0 0 8px',
        }}
      >
        Platform Overview
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          color: 'var(--color-text-muted)',
          margin: '0 0 32px',
        }}
      >
        All-time platform stats
      </p>

      {/* Stat cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <AdminStatCard
          label="Total creators"
          value={String(totalCreators ?? 0)}
          sub={`+${newCreatorsCount ?? 0} this week`}
        />
        <AdminStatCard
          label="Confirmed contributions"
          value={String(totalContributions ?? 0)}
        />
        <AdminStatCard
          label="Active pools"
          value={String(activePools ?? 0)}
        />
      </div>

      {/* Volume by currency */}
      {currencies.length > 0 && (
        <div style={{ ...cardStyle, marginBottom: 24 }}>
          <h2 style={sectionHeadingStyle}>Platform Volume</h2>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '24px 40px',
            }}
          >
            {currencies.map((c) => (
              <div key={c}>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--color-text-faint)',
                    marginBottom: 4,
                  }}
                >
                  {c}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '22px',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {formatCurrency(volumeByCurrency[c] ?? 0, c)}
                </div>
              </div>
            ))}
            {currencies.length === 0 && (
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: 'var(--color-text-muted)',
                }}
              >
                No confirmed payments yet.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stuck pending */}
      {(stuckPending?.length ?? 0) > 0 && (
        <div
          style={{
            ...cardStyle,
            borderColor: 'var(--color-danger)',
            background: 'var(--color-danger-soft)',
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              ...sectionHeadingStyle,
              color: 'var(--color-danger)',
              margin: '0 0 8px',
            }}
          >
            ⚠ {stuckPending!.length} stuck pending{' '}
            {stuckPending!.length === 1 ? 'contribution' : 'contributions'}
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--color-danger)',
              margin: '0 0 12px',
            }}
          >
            These contributions have been pending for over 1 hour. Use the Transactions
            page to re-check their status with Paystack.
          </p>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--color-danger)',
            }}
          >
            {stuckPending!.map((c) => (
              <div key={c.id}>
                {formatCurrency(c.amount, c.currency)} — ref: {c.paystack_ref}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New creators this week */}
      <div style={cardStyle}>
        <h2 style={sectionHeadingStyle}>
          New creators this week ({recentCreators?.length ?? 0})
        </h2>
        {!recentCreators || recentCreators.length === 0 ? (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--color-text-muted)',
              margin: 0,
            }}
          >
            No new signups in the last 7 days.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentCreators.map((creator) => (
              <div
                key={creator.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                <div>
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {creator.display_name}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: 'var(--color-text-muted)',
                      marginLeft: 8,
                    }}
                  >
                    @{creator.username} · {creator.currency}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    color: 'var(--color-text-faint)',
                    flexShrink: 0,
                  }}
                >
                  {formatDate(creator.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
