-- 011_add_metadata_to_applications.sql
-- Adds extensible JSONB metadata column and index to applications table

ALTER TABLE applications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS fee_type VARCHAR(100);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS amount NUMERIC(10,2);

CREATE INDEX IF NOT EXISTS idx_applications_metadata ON applications USING gin (metadata);

