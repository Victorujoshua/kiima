CREATE TABLE IF NOT EXISTS otp_verifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL,
  otp         text NOT NULL,
  purpose     text NOT NULL DEFAULT 'bank_details',
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(email, purpose)
);

CREATE INDEX IF NOT EXISTS otp_verifications_expires_idx
  ON otp_verifications(expires_at);
