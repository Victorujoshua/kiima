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

// ─── Create tag ────────────────────────────────────────────────────────────
// Creates a new custom tag for a creator. Section 4.2: creators can add
// unlimited custom tags with a label and a fixed amount.

export interface CreateTagState {
  error?: string;
  fieldErrors?: Partial<Record<'label' | 'amount', string>>;
  success?: boolean;
  tag?: GiftTag;
}

export async function createTag(
  _prevState: CreateTagState | null,
  formData: FormData
): Promise<CreateTagState> {
  const userId  = (formData.get('user_id') as string | null)?.trim() ?? '';
  const label   = (formData.get('label')   as string | null)?.trim() ?? '';
  const rawAmount = (formData.get('amount') as string | null)?.trim() ?? '';

  // Validate
  const fieldErrors: NonNullable<CreateTagState['fieldErrors']> = {};

  if (!label) {
    fieldErrors.label = 'Please enter a label for this tag.';
  } else if (label.length > 60) {
    fieldErrors.label = 'Label must be 60 characters or fewer.';
  }

  const amount = Number(rawAmount);
  if (!rawAmount || isNaN(amount) || amount <= 0) {
    fieldErrors.amount = 'Please enter a valid amount greater than 0.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  if (!userId) {
    return { error: 'Something went wrong — try again.' };
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from('gift_tags')
    .insert({ user_id: userId, label, amount, is_default: false })
    .select()
    .single();

  if (error) {
    console.error('[createTag] insert error:', { message: error.message, code: error.code });
    return { error: 'Something went wrong — try again.' };
  }

  return { success: true, tag: data as GiftTag };
}

// ─── Update tag ────────────────────────────────────────────────────────────
// Updates label and amount on a custom tag. Section 4.2: default tag cannot
// be edited — ever. Verifies ownership and is_default before touching the DB.

export interface UpdateTagState {
  error?: string;
  fieldErrors?: Partial<Record<'label' | 'amount', string>>;
  success?: boolean;
  tag?: GiftTag;
}

export async function updateTag(
  _prevState: UpdateTagState | null,
  formData: FormData
): Promise<UpdateTagState> {
  const tagId     = (formData.get('tag_id')  as string | null)?.trim() ?? '';
  const userId    = (formData.get('user_id') as string | null)?.trim() ?? '';
  const label     = (formData.get('label')   as string | null)?.trim() ?? '';
  const rawAmount = (formData.get('amount')  as string | null)?.trim() ?? '';

  const fieldErrors: NonNullable<UpdateTagState['fieldErrors']> = {};

  if (!label) {
    fieldErrors.label = 'Please enter a label for this tag.';
  } else if (label.length > 60) {
    fieldErrors.label = 'Label must be 60 characters or fewer.';
  }

  const amount = Number(rawAmount);
  if (!rawAmount || isNaN(amount) || amount <= 0) {
    fieldErrors.amount = 'Please enter a valid amount greater than 0.';
  }

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };
  if (!tagId || !userId) return { error: 'Something went wrong — try again.' };

  const supabase = createClient();

  const { data: existing, error: fetchError } = await supabase
    .from('gift_tags')
    .select('id, user_id, is_default')
    .eq('id', tagId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !existing) return { error: 'Tag not found.' };
  if (existing.is_default) return { error: 'The default tag cannot be edited.' };

  const { data, error } = await supabase
    .from('gift_tags')
    .update({ label, amount })
    .eq('id', tagId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('[updateTag] update error:', { message: error.message, code: error.code });
    return { error: 'Something went wrong — try again.' };
  }

  return { success: true, tag: data as GiftTag };
}

// ─── Delete tag ────────────────────────────────────────────────────────────
// Deletes a custom tag. Section 4.2: the default tag MUST NEVER be deleted.
// This function checks is_default before touching the database, and returns
// an error if the caller attempts to delete the default tag.

export interface DeleteTagState {
  error?: string;
  success?: boolean;
}

export async function deleteTag(tagId: string, userId: string): Promise<DeleteTagState> {
  if (!tagId || !userId) {
    return { error: 'Something went wrong — try again.' };
  }

  const supabase = createClient();

  // 1. Fetch the tag to verify ownership and is_default status BEFORE deleting.
  //    Never rely on the DB constraint alone — surface a clear error to the caller.
  const { data: tag, error: fetchError } = await supabase
    .from('gift_tags')
    .select('id, user_id, is_default')
    .eq('id', tagId)
    .eq('user_id', userId)   // ownership check — only fetch if it belongs to this user
    .single();

  if (fetchError || !tag) {
    console.error('[deleteTag] fetch error or tag not found:', fetchError?.message);
    return { error: 'Tag not found.' };
  }

  // 2. Hard block on default tag — Section 4.2: "cannot be edited or deleted — ever"
  if (tag.is_default) {
    console.error('[deleteTag] attempted to delete default tag, tagId:', tagId);
    return { error: 'The default tag cannot be deleted.' };
  }

  // 3. Delete
  const { error: deleteError } = await supabase
    .from('gift_tags')
    .delete()
    .eq('id', tagId)
    .eq('user_id', userId);

  if (deleteError) {
    console.error('[deleteTag] delete error:', { message: deleteError.message, code: deleteError.code });
    return { error: 'Something went wrong — try again.' };
  }

  return { success: true };
}
