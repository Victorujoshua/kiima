-- =============================================================================
-- Kiima — Admin Fields
-- =============================================================================
-- Ensures the `suspended` column exists on profiles.
-- Note: this column was included in 001_initial_schema.sql, so this migration
-- is a no-op for databases built from the full schema. It exists as an
-- idempotent guard for older deployments that may not have the column.
-- =============================================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS suspended boolean DEFAULT false;

-- Comment: suspended is set exclusively via admin.actions.ts (suspendCreator /
-- unsuspendCreator). It is never settable from the client. The RLS policy on
-- profiles prevents clients from changing is_admin or suspended.
