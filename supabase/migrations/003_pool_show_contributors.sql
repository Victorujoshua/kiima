ALTER TABLE support_pools
ADD COLUMN IF NOT EXISTS show_contributors boolean DEFAULT true;
