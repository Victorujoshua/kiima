import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ContributionRow from '@/components/shared/ContributionRow';
import type { Contribution } from '@/types';

// Extends Contribution with the joined pool title
interface ContributionWithPool extends Contribution {
  pool?: { title: string } | null;
}

export default async function TransactionsPage() {
  const supabase = createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: contributions } = await supabase
    .from('contributions')
    .select('*, tag:gift_tags!tag_id(*), pool:support_pools!pool_id(title)')
    .eq('recipient_id', session.user.id)
    .eq('status', 'confirmed')
    .order('created_at', { ascending: false })
    .limit(100);

  const rows = (contributions ?? []) as ContributionWithPool[];

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={headingStyle}>All gifts</h1>
        <p style={subStyle}>Every confirmed contribution you've received.</p>
      </div>

      <div style={cardStyle}>
        {rows.length === 0 ? (
          <p style={emptyStyle}>
            No gifts yet — share your link to get started ✨
          </p>
        ) : (
          <>
            <p style={countStyle}>{rows.length} contribution{rows.length !== 1 ? 's' : ''}</p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {rows.map((contribution, index) => {
                const source = contribution.pool
                  ? contribution.pool.title
                  : 'Direct gift';
                return (
                  <ContributionRow
                    key={contribution.id}
                    contribution={contribution}
                    source={source}
                    isLast={index === rows.length - 1}
                  />
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  maxWidth: '900px',
  margin: '0 auto',
  padding: '40px 0',
};

const headerStyle: React.CSSProperties = {
  marginBottom: 'var(--space-xl)',
};

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '20px',
  color: 'var(--color-text-primary)',
  margin: '0 0 4px',
};

const subStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-secondary)',
  margin: 0,
};

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--shadow-card)',
  padding: 'var(--space-xl)',
};

const countStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--color-text-faint)',
  margin: '0 0 var(--space-md)',
};

const emptyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-muted)',
  margin: 0,
  padding: 'var(--space-md) 0',
};
