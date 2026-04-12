'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { generateSlug } from '@/lib/utils/slug';
import type { SupportPool } from '@/types';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CreatePoolState {
  fieldErrors?: {
    title?: string;
    goal_amount?: string;
  };
  error?: string;
  success?: boolean;
}

export interface ContributePoolState {
  error?: string;
  success?: boolean;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function createPool(
  _prevState: CreatePoolState | null,
  formData: FormData
): Promise<CreatePoolState> {
  const supabase = createClient();

  const userId = formData.get('user_id') as string;
  const title = (formData.get('title') as string | null)?.trim() ?? '';
  const description = (formData.get('description') as string | null)?.trim() || null;
  const rawGoal = formData.get('goal_amount') as string;
  const goalAmount = Number(rawGoal);

  // Validate
  const fieldErrors: CreatePoolState['fieldErrors'] = {};

  if (!title) {
    fieldErrors.title = 'Pool title is required';
  } else if (title.length > 80) {
    fieldErrors.title = 'Title must be 80 characters or fewer';
  }

  if (!rawGoal || isNaN(goalAmount) || goalAmount <= 0) {
    fieldErrors.goal_amount = 'Enter a goal amount greater than 0';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  // Generate a slug, handling uniqueness by appending a timestamp suffix if needed
  let slug = generateSlug(title);
  if (!slug) slug = 'pool';

  // Check for slug collision within this creator's pools
  const { data: existing } = await supabase
    .from('support_pools')
    .select('id')
    .eq('user_id', userId)
    .eq('slug', slug)
    .maybeSingle();

  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  const showContributors = formData.get('show_contributors') !== 'false';

  const { error } = await supabase.from('support_pools').insert({
    user_id: userId,
    title,
    description,
    goal_amount: goalAmount,
    slug,
    status: 'open',
    raised: 0,
    show_contributors: showContributors,
  });

  if (error) {
    return { error: 'Could not create pool — please try again.' };
  }

  redirect('/dashboard/pools');
}

// ─── Stub: replaced with full Paystack flow in Phase 5.3 ────────────────────

export async function contributePool(
  _prevState: ContributePoolState | null,
  formData: FormData
): Promise<ContributePoolState> {
  const amount = Number(formData.get('amount'));
  const poolId = formData.get('pool_id') as string;

  if (!poolId) return { error: 'Something went wrong — please try again.' };
  if (!amount || amount <= 0) return { error: 'Please enter an amount.' };

  // TODO Phase 5.3: calculate fee, insert PENDING contribution, initialize Paystack
  // For now, stub returns success so the form can be wired up end-to-end.
  return { success: true };
}

export async function getPools(userId: string): Promise<SupportPool[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('support_pools')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as SupportPool[];
}

export async function updateShowContributors(
  poolId: string,
  userId: string,
  showContributors: boolean
): Promise<{ error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from('support_pools')
    .update({ show_contributors: showContributors })
    .eq('id', poolId)
    .eq('user_id', userId);

  if (error) {
    return { error: 'Could not update setting — please try again.' };
  }

  return {};
}

export async function closePool(
  poolId: string,
  userId: string
): Promise<{ error?: string }> {
  const supabase = createClient();

  // Verify ownership before closing
  const { data: pool } = await supabase
    .from('support_pools')
    .select('id, user_id, status')
    .eq('id', poolId)
    .eq('user_id', userId)
    .single();

  if (!pool) {
    return { error: 'Pool not found or access denied.' };
  }

  if (pool.status === 'closed') {
    return { error: 'This pool is already closed.' };
  }

  const { error } = await supabase
    .from('support_pools')
    .update({ status: 'closed' })
    .eq('id', poolId)
    .eq('user_id', userId);

  if (error) {
    return { error: 'Could not close pool — please try again.' };
  }

  return {};
}
