-- Migration 012: notification inbox for creators

CREATE TABLE notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type        text NOT NULL,
  -- types: 'gift_received' | 'pool_contribution' | 'pool_goal_reached'
  title       text NOT NULL,
  body        text NOT NULL,
  metadata    jsonb DEFAULT '{}',
  -- stores: { amount, sender_name, tag_used, pool_title, pool_id, etc. }
  is_read     boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- Fast per-user lookup
CREATE INDEX notifications_user_id_idx
  ON notifications(user_id);

-- Partial index for unread queries
CREATE INDEX notifications_user_unread_idx
  ON notifications(user_id, is_read) WHERE is_read = false;

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Webhook handler uses service role to create notifications
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  TO service_role
  WITH CHECK (true);
