import { createAdminClient } from '@/lib/supabase/admin';
import CreatorsClient from './CreatorsClient';
import type { ProfileWithAdmin } from '@/types';

export default async function AdminCreatorsPage() {
  const admin = createAdminClient();

  const { data: creators } = await admin
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url, currency, is_admin, suspended, created_at')
    .order('created_at', { ascending: false });

  const creatorsWithTotal = (creators ?? []) as (ProfileWithAdmin & {
    total_received: number;
  })[];

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
        Creators
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          color: 'var(--color-text-muted)',
          margin: '0 0 28px',
        }}
      >
        {creatorsWithTotal.length} total creator{creatorsWithTotal.length !== 1 ? 's' : ''}
      </p>

      <CreatorsClient creators={creatorsWithTotal} />
    </div>
  );
}
