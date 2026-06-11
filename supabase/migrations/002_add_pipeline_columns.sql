-- Add columns for the three-agent story generation pipeline

ALTER TABLE stories ADD COLUMN IF NOT EXISTS creative_brief JSONB;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS editorial_verdict JSONB;
