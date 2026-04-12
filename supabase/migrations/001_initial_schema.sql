-- =============================================================================
-- Kiima — Initial Schema
-- =============================================================================

-- ---------------------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------------------

-- Creator profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id),
  username      text UNIQUE NOT NULL,
  display_name  text NOT NULL,
  bio           text,
  avatar_url    text,
  currency      text NOT NULL DEFAULT 'NGN',  -- 'NGN' | 'USD' | 'GBP' | 'EUR'
  is_admin      boolean DEFAULT false,        -- set manually in Supabase, never via UI
  suspended     boolean DEFAULT false,        -- set by admin actions only
  created_at    timestamptz DEFAULT now()
);

-- Gift tags (both system default and custom)
CREATE TABLE gift_tags (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES profiles(id) ON DELETE CASCADE,
  label       text NOT NULL,
  amount      numeric NOT NULL,
  is_default  boolean DEFAULT false,   -- true = system "Buy me a coffee" tag
  created_at  timestamptz DEFAULT now()
);

-- Support pools
CREATE TABLE support_pools (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title       text NOT NULL,
  description text,
  goal_amount numeric NOT NULL,
  raised      numeric DEFAULT 0,       -- kept in sync via webhook
  status      text DEFAULT 'open',     -- 'open' | 'closed'
  slug        text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(user_id, slug)
);

-- All contributions (direct gifts + pool contributions)
CREATE TABLE contributions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id  uuid REFERENCES profiles(id),         -- creator receiving the gift
  pool_id       uuid REFERENCES support_pools(id),    -- null if direct gift
  tag_id        uuid REFERENCES gift_tags(id),        -- null if custom amount
  amount        numeric NOT NULL,
  currency      text NOT NULL,
  display_name  text,                                 -- null if anonymous
  is_anonymous  boolean DEFAULT false,
  paystack_ref  text UNIQUE NOT NULL,                 -- Paystack payment reference
  status        text DEFAULT 'pending',               -- 'pending' | 'confirmed'
  created_at    timestamptz DEFAULT now()
);

-- Paystack webhook event log (admin visibility only)
CREATE TABLE webhook_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type    text NOT NULL,                        -- e.g. 'charge.success'
  paystack_ref  text,                                 -- payment reference if applicable
  payload       jsonb NOT NULL,                       -- full raw webhook body
  status        text NOT NULL,                        -- 'processed' | 'failed' | 'ignored'
  error_message text,                                 -- populated if status = 'failed'
  created_at    timestamptz DEFAULT now()
);

-- Global platform settings (one row only — admin editable)
CREATE TABLE platform_settings (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  default_tag_amount_ngn  numeric NOT NULL DEFAULT 2000,
  default_tag_amount_usd  numeric NOT NULL DEFAULT 2,
  default_tag_amount_gbp  numeric NOT NULL DEFAULT 2,
  default_tag_amount_eur  numeric NOT NULL DEFAULT 2,
  maintenance_mode        boolean DEFAULT false,
  updated_at              timestamptz DEFAULT now()
);

-- Seed the single platform_settings row
INSERT INTO platform_settings (
  default_tag_amount_ngn,
  default_tag_amount_usd,
  default_tag_amount_gbp,
  default_tag_amount_eur,
  maintenance_mode
) VALUES (2000, 2, 2, 2, false);

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_tags         ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_pools     ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- profiles
--   Public read. Only owner can update.
--   is_admin and suspended cannot be updated via client — ever.

CREATE POLICY "profiles_public_read"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_owner_update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND is_admin = (SELECT is_admin FROM profiles WHERE id = auth.uid())
    AND suspended = (SELECT suspended FROM profiles WHERE id = auth.uid())
  );

-- gift_tags
--   Public read (needed for gift link page).
--   Only owner can insert/update/delete.

CREATE POLICY "gift_tags_public_read"
  ON gift_tags FOR SELECT
  USING (true);

CREATE POLICY "gift_tags_owner_insert"
  ON gift_tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "gift_tags_owner_update"
  ON gift_tags FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "gift_tags_owner_delete"
  ON gift_tags FOR DELETE
  USING (auth.uid() = user_id AND is_default = false);

-- support_pools
--   Public read. Only owner can insert/update.

CREATE POLICY "support_pools_public_read"
  ON support_pools FOR SELECT
  USING (true);

CREATE POLICY "support_pools_owner_insert"
  ON support_pools FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "support_pools_owner_update"
  ON support_pools FOR UPDATE
  USING (auth.uid() = user_id);

-- contributions
--   Public read (for contribution feeds).
--   No direct insert from client — webhook (service role) only.
--   Creator can read their own received contributions (covered by public read).

CREATE POLICY "contributions_public_read"
  ON contributions FOR SELECT
  USING (true);

-- No INSERT policy — only service role (webhook handler) writes contributions.

-- webhook_logs
--   No public access. Service role writes; admin reads via service role client.
--   No permissive policies — service role bypasses RLS entirely.

-- platform_settings
--   No public access. Admin reads/writes via service role client.
--   No permissive policies — service role bypasses RLS entirely.
