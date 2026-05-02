'use server';

import { createClient } from '@/lib/supabase/server';
import type { GiftTag } from '@/types';

// ─── Get tags by user ──────────────────────────────────────────────────────
// Returns all tags for a creator, default tag first, then custom tags by
// creation order. Safe to call from Server Components — gift_tags is public read.

export async function getTagsByUser(userId: string): Promise<GiftTag[]> {
  if (!userId) return [];

  const supabase = createClient();

  const { data, error } = await supabase
    .from('gift_tags')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false }) // default tag always first
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[getTagsByUser] error:', { message: error.message, code: error.code });
    return [];
  }

  return (data ?? []) as GiftTag[];
}

// ─── Update default tag ────────────────────────────────────────────────────
// Updates the label and amount of the creator's default gift tag.
// This is the only path that can modify a default tag (updateTag blocks it).
// Used by the GiftLabelSection on /dashboard/edit-page.

export async function updateDefaultTag(
  userId: string,
  label: string,
  amount: number
): Promise<{ success?: boolean; error?: string }> {
  if (!userId || !label) return { error: 'Something went wrong — try again.' };
  if (amount <= 0) return { error: 'Please enter a valid amount.' };

  const supabase = createClient();
  const { error } = await supabase
    .from('gift_tags')
    .update({ label, amount })
    .eq('user_id', userId)
    .eq('is_default', true);

  if (error) {
    console.error('[updateDefaultTag] error:', error.message);
    return { error: 'Something went wrong — try again.' };
  }

  return { success: true };
}

