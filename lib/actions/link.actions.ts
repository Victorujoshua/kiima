'use server';

import { createClient } from '@/lib/supabase/server';
import type { SocialLink, SocialPlatform } from '@/types';

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
