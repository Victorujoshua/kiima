-- Add fee and net_amount columns to contributions table
-- These are required by gift.actions.ts but were omitted from the initial schema.
-- IF NOT EXISTS guards make this idempotent.

ALTER TABLE contributions
  ADD COLUMN IF NOT EXISTS fee numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_amount numeric NOT NULL DEFAULT 0;
