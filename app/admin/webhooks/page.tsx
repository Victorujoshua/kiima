import { createAdminClient } from '@/lib/supabase/admin';
import type { WebhookStatus } from '@/types';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
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
  fontSize: '13px',
  color: 'var(--color-text-primary)',
  borderBottom: '1px solid var(--color-border)',
  verticalAlign: 'middle',
};

function StatusBadge({ status }: { status: WebhookStatus }) {
  const styles: Record<WebhookStatus, { bg: string; color: string }> = {
    processed: { bg: 'var(--color-success-soft)', color: 'var(--color-success)' },
    failed:    { bg: 'var(--color-danger-soft)',  color: 'var(--color-danger)'  },
    ignored:   { bg: 'rgba(28,25,22,0.05)',        color: 'var(--color-text-muted)' },
  };
  const s = styles[status] ?? styles.ignored;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        fontFamily: 'var(--font-body)',
        fontSize: '10px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        padding: '2px 7px',
        borderRadius: 'var(--radius-full)',
      }}
    >
      {status}
    </span>
  );
}

export default async function AdminWebhooksPage() {
  const admin = createAdminClient();

  const { data: events } = await admin
    .from('webhook_logs')
    .select('id, event_type, paystack_ref, status, error_message, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  const failedCount = (events ?? []).filter((e) => e.status === 'failed').length;

  return (
    <div style={{ padding: '40px 48px', maxWidth: 1100, margin: '0 auto' }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '26px',
          fontWeight: 500,
          color: 'var(--color-text-primary)',
          margin: '0 0 8px',
        }}
      >
        Webhook Log
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          color: 'var(--color-text-muted)',
          margin: '0 0 20px',
        }}
      >
        Latest 100 events received from Paystack. Read-only — this is a diagnostic tool.
      </p>

      {failedCount > 0 && (
        <div
          style={{
            padding: '12px 16px',
            background: 'var(--color-danger-soft)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-danger)',
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--color-danger)',
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          ⚠ {failedCount} failed event{failedCount !== 1 ? 's' : ''} — check the error messages below.
        </div>
      )}

      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'auto',
        }}
      >
        {!events || events.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text-muted)' }}>
            No webhook events recorded.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Timestamp</th>
                <th style={thStyle}>Event Type</th>
                <th style={thStyle}>Paystack Ref</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Error</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, i) => {
                const isLast = i === events.length - 1;
                const td: React.CSSProperties = isLast ? { ...tdStyle, borderBottom: 'none' } : tdStyle;
                const isFailed = event.status === 'failed';
                const rowStyle: React.CSSProperties = isFailed ? { background: 'var(--color-danger-soft)' } : {};

                return (
                  <tr key={event.id} style={rowStyle}>
                    <td style={{ ...td, color: 'var(--color-text-muted)', whiteSpace: 'nowrap', fontSize: '12px' }}>
                      {formatDate(event.created_at)}
                    </td>
                    <td style={{ ...td, fontFamily: 'monospace', fontSize: '12px' }}>
                      {event.event_type}
                    </td>
                    <td style={{ ...td, fontFamily: 'monospace', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      {event.paystack_ref ?? '—'}
                    </td>
                    <td style={td}>
                      <StatusBadge status={event.status as WebhookStatus} />
                    </td>
                    <td style={{ ...td, fontSize: '12px', color: 'var(--color-danger)', maxWidth: 320 }}>
                      {event.error_message ?? '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
