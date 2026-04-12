-- =============================================================================
-- Kiima — Default Gift Tag Trigger
-- =============================================================================
-- Automatically inserts the "Buy me a coffee ☕" default tag whenever a new
-- profile row is inserted. Reads the correct default amount from
-- platform_settings based on the creator's chosen currency so the amount
-- stays in sync with whatever the admin has configured.
--
-- SECURITY DEFINER: runs as the function owner (postgres) so it can write to
-- gift_tags regardless of the calling user's RLS context.
-- SET search_path = public: prevents search_path hijacking.
-- =============================================================================

CREATE OR REPLACE FUNCTION create_default_gift_tag()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_amount numeric;
BEGIN
  -- Look up the per-currency default amount from platform_settings.
  -- CASE maps the profile's currency to the correct column.
  -- Fallback to 2000 if platform_settings is somehow empty.
  SELECT
    CASE NEW.currency
      WHEN 'NGN' THEN default_tag_amount_ngn
      WHEN 'USD' THEN default_tag_amount_usd
      WHEN 'GBP' THEN default_tag_amount_gbp
      WHEN 'EUR' THEN default_tag_amount_eur
      ELSE            default_tag_amount_ngn   -- unknown currency falls back to NGN
    END
  INTO v_amount
  FROM platform_settings
  LIMIT 1;

  -- Hard fallback if platform_settings row does not exist yet
  IF v_amount IS NULL THEN
    v_amount := 2000;
  END IF;

  INSERT INTO gift_tags (user_id, label, amount, is_default)
  VALUES (NEW.id, 'Buy me a coffee ☕', v_amount, true);

  RETURN NEW;
END;
$$;

-- Drop trigger first in case this migration is re-run (idempotent)
DROP TRIGGER IF EXISTS on_profile_created_insert_default_tag ON profiles;

CREATE TRIGGER on_profile_created_insert_default_tag
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_gift_tag();
