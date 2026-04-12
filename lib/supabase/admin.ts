import { createClient } from '@supabase/supabase-js';

// Service role client — bypasses RLS.
// Use ONLY in webhook handlers and admin server actions.
// Never import this in client components or public-facing server components.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
