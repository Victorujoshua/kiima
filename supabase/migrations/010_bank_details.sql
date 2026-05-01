-- Add bank account fields to profiles for payout setup
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bank_name                text,
  ADD COLUMN IF NOT EXISTS bank_code                text,
  ADD COLUMN IF NOT EXISTS account_number           text,
  ADD COLUMN IF NOT EXISTS account_name             text,
  ADD COLUMN IF NOT EXISTS paystack_subaccount_code text;
