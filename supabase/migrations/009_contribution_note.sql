-- Migration 009: Add note column to contributions
-- Run this in the Supabase SQL Editor before deploying the email feature.

ALTER TABLE contributions
  ADD COLUMN IF NOT EXISTS note text;
