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
  created_at: string;
}

export interface Contribution {
  id: string;
  recipient_id: string;
  pool_id: string | null;
  tag_id: string | null;
  amount: number;
  fee: number;          // 3% platform fee
  net_amount: number;   // amount - fee
  currency: Currency;
  display_name: string | null;   // null = anonymous
  is_anonymous: boolean;
  paystack_ref: string;
  status: ContributionStatus;
  created_at: string;
  // Joined fields
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
}
