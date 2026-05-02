-- Migration 011: Add theme_color to profiles
-- Lets creators choose an accent colour for their gift page.
-- Defaults to '#C87B5C' (Terracotta — the existing Kiima accent).

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS theme_color text DEFAULT '#C87B5C';
