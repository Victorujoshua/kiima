-- =============================================================================
-- Kiima — Social Links
-- =============================================================================
-- Creates the social_links table with RLS.
-- One row per platform per creator (enforced by UNIQUE constraint).
-- Idempotent: safe to run against databases that already have the table.
-- =============================================================================

CREATE TABLE IF NOT EXISTS social_links (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  platform       text NOT NULL
                 CHECK (platform IN ('instagram','tiktok','twitter','youtube','linkedin','website')),
  url            text NOT NULL,
  display_order  int DEFAULT 0,
  created_at     timestamptz DEFAULT now(),
  UNIQUE(user_id, platform)
);

ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

-- Public read — anyone can see a creator's social links (needed for gift page)
DROP POLICY IF EXISTS "Public can read social links" ON social_links;
CREATE POLICY "Public can read social links"
  ON social_links FOR SELECT
  USING (true);

-- Owner insert
DROP POLICY IF EXISTS "Owner can insert social links" ON social_links;
CREATE POLICY "Owner can insert social links"
  ON social_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Owner update
DROP POLICY IF EXISTS "Owner can update social links" ON social_links;
CREATE POLICY "Owner can update social links"
  ON social_links FOR UPDATE
  USING (auth.uid() = user_id);

-- Owner delete
DROP POLICY IF EXISTS "Owner can delete social links" ON social_links;
CREATE POLICY "Owner can delete social links"
  ON social_links FOR DELETE
  USING (auth.uid() = user_id);
