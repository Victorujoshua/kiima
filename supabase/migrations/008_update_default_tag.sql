-- =============================================================================
-- Kiima — Update default tag label from coffee to drink
-- =============================================================================
-- Updates all existing default tags in production.
-- New signups already get "Buy me a drink 🥤" via the updated trigger (002).
-- =============================================================================

UPDATE gift_tags
SET label = 'Buy me a drink 🥤'
WHERE is_default = true;
