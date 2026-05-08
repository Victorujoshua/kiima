-- =============================================================================
-- Kiima — Creator Link Cards
-- =============================================================================
-- Creates the creator_links table with RLS.
-- Each row is an external link card shown on the creator's public page.
-- Replaces Linktree — Kiima is the only link-in-bio tool a creator needs.
-- Idempotent: safe to run against databases that already have the table.
-- =============================================================================

CREATE TABLE IF NOT EXISTS creator_links (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title         text NOT NULL,
  url           text NOT NULL,
  description   text,
  thumbnail_url text,
  sort_order    int DEFAULT 0,
  is_active     boolean DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE creator_links ENABLE ROW LEVEL SECURITY;

-- Public read — active links are shown on the public creator page
DROP POLICY IF EXISTS "Public can read creator links" ON creator_links;
CREATE POLICY "Public can read creator links"
  ON creator_links FOR SELECT
  USING (true);

-- Owner insert
DROP POLICY IF EXISTS "Owner can insert creator links" ON creator_links;
CREATE POLICY "Owner can insert creator links"
  ON creator_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Owner update
DROP POLICY IF EXISTS "Owner can update creator links" ON creator_links;
CREATE POLICY "Owner can update creator links"
  ON creator_links FOR UPDATE
  USING (auth.uid() = user_id);

-- Owner delete
DROP POLICY IF EXISTS "Owner can delete creator links" ON creator_links;
CREATE POLICY "Owner can delete creator links"
  ON creator_links FOR DELETE
  USING (auth.uid() = user_id);
