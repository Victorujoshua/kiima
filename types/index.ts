export type Currency = 'NGN' | 'USD' | 'GBP' | 'EUR';
export type PoolStatus = 'open' | 'closed';
export type ContributionStatus = 'pending' | 'confirmed';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  currency: Currency;
  theme_color: string;           // accent colour for gift page, default '#C87B5C'
  show_contributions: boolean;   // whether gifters see the supporters list, default true
  created_at: string;
}

export interface GiftTag {
  id: string;
  user_id: string;
  label: string;
  amount: number;
  is_default: boolean;
  created_at: string;
}

export interface SupportPool {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  goal_amount: number;
  raised: number;
  status: PoolStatus;
  slug: string;
  show_contributors: boolean;
  created_at: string;
}

export interface Contribution {
  id: string;
  recipient_id: string;
  pool_id: string | null;
  tag_id: string | null;
  tag_label: string | null;    // snapshotted at payment time — use this for display, not tag?.label
  gift_amount: number;         // amount gifter intends to send to creator
  paystack_fee: number;        // 1.5% + ₦100 — added on top, paid by gifter
  kiima_fee: number;           // 3% platform fee — deducted from creator via split
  creator_amount: number;      // gift_amount - kiima_fee (what creator receives)
  total_charged: number;       // gift_amount + paystack_fee (what gifter pays)
  currency: Currency;
  display_name: string | null; // null = anonymous
  is_anonymous: boolean;
  paystack_ref: string;
  status: ContributionStatus;
  note: string | null;
  created_at: string;
  // Joined fields (only present when explicitly joined — prefer tag_label for display)
  tag?: GiftTag;
}

export type WebhookStatus = 'processed' | 'failed' | 'ignored';

export interface WebhookLog {
  id: string;
  event_type: string;
  paystack_ref: string | null;
  payload: Record<string, unknown>;
  status: WebhookStatus;
  error_message: string | null;
  created_at: string;
}

export interface PlatformSettings {
  id: string;
  platform_fee_percent: number;  // default 3 — Kiima's cut from creator
  default_tag_amount_ngn: number;
  default_tag_amount_usd: number;
  default_tag_amount_gbp: number;
  default_tag_amount_eur: number;
  maintenance_mode: boolean;
  updated_at: string;
}

// Profile extended with admin flag — only used in admin context
export interface ProfileWithAdmin extends Profile {
  is_admin: boolean;
  suspended: boolean;
}

export type SocialPlatform = 'instagram' | 'tiktok' | 'twitter' | 'youtube' | 'linkedin' | 'website';

export interface SocialLink {
  id: string;
  user_id: string;
  platform: SocialPlatform;
  url: string;
  display_order: number;
  created_at: string;
}

export type NotificationType = 'gift_received' | 'pool_contribution' | 'pool_goal_reached';

export interface NotificationMetadata {
  amount?: number;
  sender_name?: string;
  tag_used?: string | null;
  contribution_id?: string;
  pool_title?: string;
  pool_id?: string;
  pool_goal?: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata: NotificationMetadata;
  is_read: boolean;
  created_at: string;
}
