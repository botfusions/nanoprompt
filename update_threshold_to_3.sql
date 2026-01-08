-- Update Trigger to include Score 3 (Good) as Top Tier
-- This makes the criteria: Score >= 3

-- 1. Drop old function
DROP FUNCTION IF EXISTS copy_high_score_prompts CASCADE;

-- 2. Update Constraint on Top Table
ALTER TABLE banana_top_prompts DROP CONSTRAINT IF EXISTS banana_top_prompts_conversion_score_check;
ALTER TABLE banana_top_prompts ADD CONSTRAINT banana_top_prompts_conversion_score_check CHECK (conversion_score >= 3);

-- 3. Re-create Function with new threshold (>= 3)
CREATE OR REPLACE FUNCTION copy_high_score_prompts()
RETURNS TRIGGER AS $$
BEGIN
  -- Now accepting 3, 4, 5
  IF NEW.conversion_score >= 3 THEN
    INSERT INTO banana_top_prompts (id, prompt, title, images, conversion_score, visual_style, short_reason)
    VALUES (NEW.id, NEW.prompt, NEW.title, NEW.images, NEW.conversion_score, NEW.visual_style, NEW.short_reason)
    ON CONFLICT (id) DO UPDATE 
    SET conversion_score = NEW.conversion_score, short_reason = NEW.short_reason;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Re-attach Trigger
CREATE TRIGGER trg_copy_high_score
AFTER UPDATE OF conversion_score ON banana_prompts
FOR EACH ROW
EXECUTE FUNCTION copy_high_score_prompts();
