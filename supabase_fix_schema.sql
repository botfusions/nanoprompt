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

CREATE OR REPLACE FUNCTION copy_high_score_prompts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.conversion_score >= 4 THEN
    INSERT INTO banana_top_prompts (id, prompt, title, images, conversion_score, visual_style, short_reason)
    VALUES (NEW.id, NEW.prompt, NEW.title, NEW.images, NEW.conversion_score, NEW.visual_style, NEW.short_reason)
    ON CONFLICT (id) DO UPDATE 
    SET conversion_score = NEW.conversion_score, short_reason = NEW.short_reason;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_copy_high_score ON banana_prompts;
CREATE TRIGGER trg_copy_high_score
AFTER UPDATE OF conversion_score ON banana_prompts
FOR EACH ROW
EXECUTE FUNCTION copy_high_score_prompts();
