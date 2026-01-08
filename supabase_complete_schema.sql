-- 1. Add missing columns to the main table (banana_prompts)
ALTER TABLE banana_prompts 
ADD COLUMN IF NOT EXISTS use_case TEXT,
ADD COLUMN IF NOT EXISTS visual_style TEXT,
ADD COLUMN IF NOT EXISTS camera_framing TEXT,
ADD COLUMN IF NOT EXISTS lighting_type TEXT,
ADD COLUMN IF NOT EXISTS subject_type TEXT,
ADD COLUMN IF NOT EXISTS conversion_score INTEGER,
ADD COLUMN IF NOT EXISTS short_reason TEXT;

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_banana_prompts_conversion_score ON banana_prompts(conversion_score);

-- 3. Create the Top Prompts table (for score >= 4)
CREATE TABLE IF NOT EXISTS banana_top_prompts (
  id TEXT PRIMARY KEY REFERENCES banana_prompts(id),
  prompt TEXT NOT NULL,
  title TEXT,
  images JSONB,
  conversion_score INTEGER CHECK (conversion_score >= 4),
  visual_style TEXT,
  short_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Trigger Function to auto-copy high scores
CREATE OR REPLACE FUNCTION copy_high_score_prompts()
RETURNS TRIGGER AS $$
BEGIN
  -- Only copy if score is 4 or 5
  IF NEW.conversion_score >= 4 THEN
    INSERT INTO banana_top_prompts (id, prompt, title, images, conversion_score, visual_style, short_reason)
    VALUES (NEW.id, NEW.prompt, NEW.title, NEW.images, NEW.conversion_score, NEW.visual_style, NEW.short_reason)
    ON CONFLICT (id) DO UPDATE 
    SET conversion_score = NEW.conversion_score, short_reason = NEW.short_reason;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Attach Trigger to banana_prompts
DROP TRIGGER IF EXISTS trg_copy_high_score ON banana_prompts;
CREATE TRIGGER trg_copy_high_score
AFTER UPDATE OF conversion_score ON banana_prompts
FOR EACH ROW
EXECUTE FUNCTION copy_high_score_prompts();
