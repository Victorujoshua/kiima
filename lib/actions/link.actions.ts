'use server';

import { createClient } from '@/lib/supabase/server';
import type { SocialLink, SocialPlatform, CreatorLink } from '@/types';

// URL validation per Section 4.8
function validateUrl(platform: SocialPlatform, url: string): string | null {
  if (!url.startsWith('https://')) {
    return 'URL must begin with https://';
  }

  const domainChecks: Record<SocialPlatform, (u: string) => boolean> = {
    instagram: (u) => u.includes('instagram.com'),
    tiktok:    (u) => u.includes('tiktok.com'),
    twitter:   (u) => u.includes('twitter.com') || u.includes('x.com'),
    youtube:   (u) => u.includes('youtube.com'),
    linkedin:  (u) => u.includes('linkedin.com'),
    website:   ()  => true,
  };

  if (!domainChecks[platform](url)) {
    const expectedDomain: Record<SocialPlatform, string> = {
      instagram: 'instagram.com',
      tiktok:    'tiktok.com',
      twitter:   'twitter.com or x.com',
      youtube:   'youtube.com',
      linkedin:  'linkedin.com',
      website:   'any https:// URL',
    };
    return `${platform} link must contain ${expectedDomain[platform]}`;
  }

  return null;
}

export async function getSocialLinks(userId: string): Promise<SocialLink[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('social_links')
    .select('*')
    .eq('user_id', userId)
    .order('display_order', { ascending: true });
  return (data ?? []) as SocialLink[];
}

export async function upsertSocialLink(
  userId: string,
  platform: SocialPlatform,
  url: string
): Promise<{ error?: string }> {
  // Empty URL → treat as delete
  if (!url.trim()) {
    return deleteSocialLink(userId, platform);
  }

  const validationError = validateUrl(platform, url.trim());
  if (validationError) {
    return { error: validationError };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('social_links')
    .upsert(
      { user_id: userId, platform, url: url.trim() },
      { onConflict: 'user_id,platform' }
    );

  if (error) return { error: 'Could not save link — try again.' };
  return {};
}

export async function deleteSocialLink(
  userId: string,
  platform: SocialPlatform
): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from('social_links')
    .delete()
    .eq('user_id', userId)
    .eq('platform', platform);

  if (error) return { error: 'Could not remove link — try again.' };
  return {};
}

// ─── Creator link cards (creator_links table) ─────────────────────────────────

export async function getCreatorLinks(
  userId: string,
  activeOnly = false
): Promise<CreatorLink[]> {
  const supabase = createClient();
  let query = supabase
    .from('creator_links')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (activeOnly) query = query.eq('is_active', true);

  const { data } = await query;
  return (data ?? []) as CreatorLink[];
}

export async function upsertCreatorLink(
  userId: string,
  link: { id?: string; title: string; url: string; description?: string; thumbnail_url?: string; sort_order?: number; is_active?: boolean }
): Promise<{ error?: string; data?: CreatorLink }> {
  if (!link.title.trim()) return { error: 'Title is required.' };
  if (!link.url.trim()) return { error: 'URL is required.' };
  if (!link.url.startsWith('https://')) return { error: 'URL must begin with https://' };

  const supabase = createClient();

  const payload: Record<string, unknown> = {
    user_id: userId,
    title: link.title.trim(),
    url: link.url.trim(),
    description: link.description?.trim() || null,
    thumbnail_url: link.thumbnail_url?.trim() || null,
    is_active: link.is_active ?? true,
  };

  if (link.id) {
    // Update existing
    const { data, error } = await supabase
      .from('creator_links')
      .update(payload)
      .eq('id', link.id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) return { error: 'Could not save link — try again.' };
    return { data: data as CreatorLink };
  } else {
    // Insert new — get next sort_order
    const { count } = await supabase
      .from('creator_links')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if ((count ?? 0) >= 10) return { error: 'Maximum 10 links allowed.' };

    payload.sort_order = count ?? 0;

    const { data, error } = await supabase
      .from('creator_links')
      .insert(payload)
      .select()
      .single();
    if (error) return { error: 'Could not save link — try again.' };
    return { data: data as CreatorLink };
  }
}

export async function deleteCreatorLink(
  userId: string,
  linkId: string
): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from('creator_links')
    .delete()
    .eq('id', linkId)
    .eq('user_id', userId);

  if (error) return { error: 'Could not delete link — try again.' };
  return {};
}

export async function reorderCreatorLinks(
  userId: string,
  orderedIds: string[]
): Promise<{ error?: string }> {
  const supabase = createClient();

  const updates = orderedIds.map((id, index) =>
    supabase
      .from('creator_links')
      .update({ sort_order: index })
      .eq('id', id)
      .eq('user_id', userId)
  );

  const results = await Promise.all(updates);
  const failed = results.find(r => r.error);
  if (failed?.error) return { error: 'Could not reorder links — try again.' };
  return {};
}
