-- =============================================================================
-- Kiima — Profile Embed Slot
-- =============================================================================
-- Adds embed_url column to profiles.
-- Each creator can embed one YouTube, Twitter/X, or Spotify URL on their page.
-- Idempotent: safe to run if column already exists.
-- =============================================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS embed_url text;
