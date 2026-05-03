import type { Contribution } from '@/types';
import { formatCurrency } from './currency';

export type SocialPlatform = 'instagram' | 'twitter' | 'tiktok';

export function parseSocialHandle(
  displayName: string | null
): { platform: SocialPlatform; handle: string } | null {
  if (!displayName) return null;
  const match = displayName.trim().match(/^(instagram|twitter|tiktok):(@\S+)$/);
  if (!match) return null;
  return { platform: match[1] as SocialPlatform, handle: match[2] };
}

/**
 * resolveDisplayName(displayName, isAnonymous)
 * Always use this. Never inline anonymous logic.
 *
 * resolveDisplayName("Victor", false)  → "Victor"
 * resolveDisplayName(null,     false)  → "Anonymous"
 * resolveDisplayName("Victor", true)   → "Anonymous"
 * resolveDisplayName(null,     true)   → "Anonymous"
 */
export function resolveDisplayName(
  displayName: string | null,
  isAnonymous: boolean
): string {
  if (isAnonymous) return 'Anonymous';
  if (!displayName || !displayName.trim()) return 'Anonymous';
  const social = parseSocialHandle(displayName);
  return social ? social.handle : displayName.trim();
}

/**
 * formatContributionLine(contribution)
 * Always use this. Never format contribution lines inline.
 *
 * → "Victor sent ₦5,000"
 * → "Anonymous sent ₦2,000"
 * → "Anonymous bought a coffee ☕"  (when default tag + anonymous)
 */
export function formatContributionLine(contribution: Contribution): string {
  // Section 4.5: special phrasing for anonymous + default tag
  // Use tag_id (always on the row) instead of tag?.is_default (requires JOIN)
  if (contribution.is_anonymous && contribution.tag_id !== null) {
    return 'Anonymous sent a gift 🎁';
  }

  const name = resolveDisplayName(contribution.display_name, contribution.is_anonymous);
  const amount = formatCurrency(contribution.gift_amount, contribution.currency);
  return `${name} sent ${amount}`;
}
