'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <button type="button" onClick={handleLogout} style={btnStyle}>
      Log out
    </button>
  );
}

const btnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 500,
  fontSize: '13px',
  color: 'var(--color-text-muted)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '10px var(--space-md)',
  textAlign: 'left',
  width: '100%',
  transition: 'color 0.15s ease',
};
