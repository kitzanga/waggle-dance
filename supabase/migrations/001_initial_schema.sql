-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Stories table
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  topic TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'intake'
    CHECK (status IN ('intake', 'generating', 'complete', 'error')),

  -- Source document
  source_document_url TEXT,
  source_document_type TEXT CHECK (source_document_type IN ('pdf', 'pptx', 'docx')),

  -- Intake data
  intake_transcript JSONB DEFAULT '[]'::jsonb,
  intake_signals JSONB DEFAULT '{}'::jsonb,

  -- Engine internals (never exposed to UI)
  framework_selected TEXT[],

  -- Story content
  story_content JSONB DEFAULT '[]'::jsonb,

  -- Version history for revert
  previous_versions JSONB DEFAULT '[]'::jsonb,

  -- Visual style
  visual_style TEXT NOT NULL DEFAULT 'watercolor'
    CHECK (visual_style IN ('watercolor', 'manga', 'flat', 'ink_sketch')),
  style_prompt TEXT,
  visuals_enabled BOOLEAN NOT NULL DEFAULT true,

  -- Sharing
  share_token UUID UNIQUE DEFAULT uuid_generate_v4(),
  share_active BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_stories_share_token ON stories(share_token) WHERE share_active = true;
CREATE INDEX idx_stories_updated_at ON stories(user_id, updated_at DESC);

-- Row Level Security
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Creator can CRUD their own stories
CREATE POLICY "Users can view own stories" ON stories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stories" ON stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stories" ON stories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stories" ON stories
  FOR DELETE USING (auth.uid() = user_id);

-- Policy: Public read access via share token (for reader view)
CREATE POLICY "Public can read shared stories" ON stories
  FOR SELECT USING (share_active = true);

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Trigger: auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
