-- Migration 018: withdrawals table
-- Tracks creator withdrawal requests. Status managed manually / by admin.
-- Balance validation happens in requestWithdrawal server action.

CREATE TABLE IF NOT EXISTS withdrawals (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount         numeric NOT NULL,
  currency       text NOT NULL,
  bank_name      text NOT NULL,
  account_number text NOT NULL,
  account_name   text NOT NULL DEFAULT '',
  status         text NOT NULL DEFAULT 'pending',
  -- 'pending' | 'processing' | 'completed' | 'cancelled'
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS withdrawals_user_id_idx ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS withdrawals_status_idx  ON withdrawals(status);

ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view own withdrawals"
  ON withdrawals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Creators can request own withdrawals"
  ON withdrawals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
