-- Migration: AI Görsel Oluşturucu + Kredi Sistemi
-- Tarih: 2026-05-13

-- 1. user_credits tablosu
CREATE TABLE IF NOT EXISTS user_credits (
  user_id TEXT PRIMARY KEY REFERENCES "IMAGE PROMPT_profiles"(id) ON DELETE CASCADE,
  credits INTEGER DEFAULT 3,
  total_purchased INTEGER DEFAULT 0,
  total_used INTEGER DEFAULT 0,
  last_free_refill TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. credit_transactions tablosu
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('generation', 'purchase', 'daily_refill', 'admin_grant', 'refund')),
  description TEXT,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. generated_images tablosu
CREATE TABLE IF NOT EXISTS generated_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  enhanced_prompt TEXT,
  negative_prompt TEXT,
  model TEXT NOT NULL,
  image_url TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  generation_time_ms INTEGER,
  credits_used INTEGER DEFAULT 1,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RLS aktif et
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

-- 5. RLS Politikaları - user_credits
CREATE POLICY "Users can read own credits"
  ON user_credits FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can insert own credits"
  ON user_credits FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can update own credits"
  ON user_credits FOR UPDATE
  TO anon
  USING (true);

-- 6. RLS Politikaları - credit_transactions
CREATE POLICY "Users can read own transactions"
  ON credit_transactions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can insert own transactions"
  ON credit_transactions FOR INSERT
  TO anon
  WITH CHECK (true);

-- 7. RLS Politikaları - generated_images
CREATE POLICY "Users can read own generated images"
  ON generated_images FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can insert own generated images"
  ON generated_images FOR INSERT
  TO anon
  WITH CHECK (true);

-- 8. Index'ler
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_images_user_id ON generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_created_at ON generated_images(created_at DESC);
