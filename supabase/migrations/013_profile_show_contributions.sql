-- Add show_contributions toggle to profiles
-- Controls whether the supporters/contributions list is visible on the public gift page.
-- Default true — existing creators show contributions unless they opt out.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS show_contributions boolean NOT NULL DEFAULT true;
