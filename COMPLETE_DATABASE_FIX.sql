-- =============================================
-- THE KING - SCACCHI 3D: DEFINITIVE DATABASE SETUP
-- =============================================
-- Copy and paste this script into the Supabase SQL Editor.
-- This script ensures ALL tables, columns, and storage buckets are correctly configured.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES
-- Profiles: Stores user-specific settings and identity
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  nickname TEXT,
  email TEXT,
  avatar_url TEXT,
  active_assets JSONB DEFAULT '{}'::jsonb,
  custom_rotations JSONB DEFAULT '{}'::jsonb,
  current_kit_id TEXT, -- References asset_collections(id)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asset Collections: Store 3D kits (Shop & Community)
CREATE TABLE IF NOT EXISTS public.asset_collections (
  id TEXT PRIMARY KEY, -- Using TEXT for human-readable IDs (e.g. 'classic_gold_123')
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('chess', 'checkers')),
  price_eur NUMERIC(10, 2) DEFAULT 0,
  assets JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_public BOOLEAN DEFAULT false,
  is_official BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  author_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Career Progress: Tracks levels and scores
CREATE TABLE IF NOT EXISTS public.career_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  chess_level INTEGER DEFAULT 1,
  checkers_level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  current_game_state JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STORAGE BUCKETS
-- Insert buckets (will fail if already exist, which is fine)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('custom_assets', 'custom_assets', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('library', 'library', true) ON CONFLICT DO NOTHING;

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_progress ENABLE ROW LEVEL SECURITY;

-- 4.1 Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 4.2 Asset Collections Policies
CREATE POLICY "Anyone can view approved/official kits" ON public.asset_collections FOR SELECT USING (status = 'approved' OR is_official = true OR auth.uid() = author_id);
CREATE POLICY "Logged in users can submit kits" ON public.asset_collections FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage all kits" ON public.asset_collections FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- 4.3 Career Progress Policies
CREATE POLICY "Users can view own progress" ON public.career_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.career_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.career_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4.4 Storage Policies (Avatars)
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4.5 Storage Policies (Custom Assets)
CREATE POLICY "Custom assets are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'custom_assets' OR bucket_id = 'library');
CREATE POLICY "Users can upload custom assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'custom_assets');

-- 5. AUTH TRIGGER (Auto profile creation)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'User_' || substr(NEW.id::text, 1, 8)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.career_progress (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- FINAL CHECK: If columns were missing, this adds them specifically
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nickname TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_rotations JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_assets JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_kit_id TEXT;
