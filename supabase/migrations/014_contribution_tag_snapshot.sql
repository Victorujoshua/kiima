-- Snapshot tag label at contribution creation time so historical records
-- always display the label that was used at the moment of the gift.
ALTER TABLE contributions
  ADD COLUMN IF NOT EXISTS tag_label text;

-- Backfill existing rows from current tag label
UPDATE contributions c
SET tag_label = gt.label
FROM gift_tags gt
WHERE c.tag_id = gt.id
  AND c.tag_label IS NULL;
