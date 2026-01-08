-- Add new columns for AI Prompt Evaluation
-- run this in Supabase SQL Editor

ALTER TABLE banana_prompts 
ADD COLUMN IF NOT EXISTS use_case TEXT,
ADD COLUMN IF NOT EXISTS visual_style TEXT,
ADD COLUMN IF NOT EXISTS camera_framing TEXT,
ADD COLUMN IF NOT EXISTS lighting_type TEXT,
ADD COLUMN IF NOT EXISTS subject_type TEXT,
ADD COLUMN IF NOT EXISTS conversion_score INTEGER,
ADD COLUMN IF NOT EXISTS short_reason TEXT;

-- Index for fast filtering by score
CREATE INDEX IF NOT EXISTS idx_banana_prompts_conversion_score ON banana_prompts(conversion_score);
