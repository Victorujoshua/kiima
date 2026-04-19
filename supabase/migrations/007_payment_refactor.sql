-- Refactor contributions fee model: rename/add columns to support the
-- two-party fee structure (gifter pays Paystack fee, creator pays Kiima fee).
-- Run AFTER migrations 001–006.

-- Rename existing columns to their new names
ALTER TABLE contributions RENAME COLUMN amount TO gift_amount;
ALTER TABLE contributions RENAME COLUMN fee TO kiima_fee;
ALTER TABLE contributions RENAME COLUMN net_amount TO creator_amount;

-- Add the two new columns (gifter-side fee tracking)
ALTER TABLE contributions
  ADD COLUMN IF NOT EXISTS paystack_fee numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_charged numeric NOT NULL DEFAULT 0;

-- Add platform_fee_percent to platform_settings (Kiima's cut from creator)
ALTER TABLE platform_settings
  ADD COLUMN IF NOT EXISTS platform_fee_percent numeric NOT NULL DEFAULT 3;

-- Ensure the single settings row has the value set
UPDATE platform_settings SET platform_fee_percent = 3;
