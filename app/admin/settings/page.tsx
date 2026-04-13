import { createAdminClient } from '@/lib/supabase/admin';
import SettingsForm from './SettingsForm';
import type { PlatformSettings } from '@/types';

export default async function AdminSettingsPage() {
  const admin = createAdminClient();

  const { data: settings } = await admin
    .from('platform_settings')
    .select('*')
    .single();

  if (!settings) {
    return (
      <div style={{ padding: '40px 48px' }}>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--color-danger)',
          }}
        >
          Platform settings row not found. Run the initial migration to seed it.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 48px', maxWidth: 760, margin: '0 auto' }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '26px',
          fontWeight: 500,
          color: 'var(--color-text-primary)',
          margin: '0 0 8px',
        }}
      >
        Platform Settings
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          color: 'var(--color-text-muted)',
          margin: '0 0 32px',
        }}
      >
        Last updated:{' '}
        {new Date(settings.updated_at).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>

      <SettingsForm settings={settings as PlatformSettings} />
    </div>
  );
}
