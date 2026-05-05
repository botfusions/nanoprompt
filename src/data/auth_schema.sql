-- =============================================
-- IMAGE PROMPT User Authentication & Prompt Schema
-- =============================================

-- 1. IMAGE PROMPT Profiles Table
CREATE TABLE IF NOT EXISTS IMAGE PROMPT_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  twitter_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE IMAGE PROMPT_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON IMAGE PROMPT_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON IMAGE PROMPT_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON IMAGE PROMPT_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================

-- 2. IMAGE PROMPT User Prompts Table
CREATE TABLE IF NOT EXISTS IMAGE PROMPT_user_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES IMAGE PROMPT_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  image_url TEXT,
  categories TEXT[] DEFAULT '{}',
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE IMAGE PROMPT_user_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved prompts are viewable by everyone" ON IMAGE PROMPT_user_prompts
  FOR SELECT USING (approved = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert own prompts" ON IMAGE PROMPT_user_prompts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prompts" ON IMAGE PROMPT_user_prompts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prompts" ON IMAGE PROMPT_user_prompts
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================

-- 3. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_IMAGE PROMPT_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.IMAGE PROMPT_profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_IMAGE PROMPT ON auth.users;
CREATE TRIGGER on_auth_user_created_IMAGE PROMPT
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_IMAGE PROMPT_user();
