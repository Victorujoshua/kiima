import { createAdminClient } from '@/lib/supabase/admin';
import DeleteTagButton from './DeleteTagButton';

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
  padding: '11px 16px',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-primary)',
  borderBottom: '1px solid var(--color-border)',
  verticalAlign: 'middle',
};

export default async function AdminTagsPage() {
  const admin = createAdminClient();

  // Fetch all custom tags (not the system default) with creator info
  const { data: tags } = await admin
    .from('gift_tags')
    .select('id, label, amount, created_at, user_id, profiles!user_id(display_name, username, currency)')
    .eq('is_default', false)
    .order('created_at', { ascending: false });

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
        Custom Tags
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          color: 'var(--color-text-muted)',
          margin: '0 0 28px',
        }}
      >
        All custom gift tags across the platform. System default tags are excluded.
        Delete tags with inappropriate or offensive labels.
      </p>

      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'auto',
        }}
      >
        {!tags || tags.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text-muted)' }}>
            No custom tags on the platform.
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Label</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Creator</th>
                  <th style={thStyle}>Created</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {tags.map((tag, i) => {
                  const isLast = i === tags.length - 1;
                  const td: React.CSSProperties = isLast ? { ...tdStyle, borderBottom: 'none' } : tdStyle;
                  const creator = (tag as Record<string, unknown>).profiles as { display_name: string; username: string; currency: string } | null;

                  return (
                    <tr key={tag.id}>
                      <td style={td}>
                        <span style={{ fontWeight: 500 }}>{tag.label}</span>
                      </td>
                      <td style={{ ...td, color: 'var(--color-text-secondary)' }}>
                        {tag.amount.toLocaleString('en')}{creator ? ` ${creator.currency}` : ''}
                      </td>
                      <td style={td}>
                        {creator ? (
                          <a
                            href={`/admin/creators/${tag.user_id}`}
                            style={{ color: 'var(--color-accent)', textDecoration: 'none', fontSize: '13px' }}
                          >
                            @{creator.username}
                          </a>
                        ) : '—'}
                      </td>
                      <td style={{ ...td, color: 'var(--color-text-muted)' }}>
                        {formatDate(tag.created_at)}
                      </td>
                      <td style={td}>
                        <DeleteTagButton tagId={tag.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-muted)' }}>
              {tags.length} custom tag{tags.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
