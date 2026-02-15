-- ============================================
-- SETUP SUPABASE PER SCACCHI 3D
-- ============================================
-- Questo file contiene tutti gli script SQL necessari
-- per configurare correttamente il database Supabase

-- ============================================
-- 1. BUCKET STORAGE PER AVATARS
-- ============================================
-- Vai su Supabase Dashboard > Storage > Create Bucket
-- Nome: avatars
-- Pubblico: SÌ
-- File size limit: 5MB
-- Allowed MIME types: image/*

-- Oppure usa questo comando (se hai accesso SQL):
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('avatars', 'avatars', true);

-- Policy RLS per il bucket avatars:
-- Permetti a tutti di leggere gli avatar
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Permetti agli utenti autenticati di caricare il proprio avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permetti agli utenti di aggiornare il proprio avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permetti agli utenti di eliminare il proprio avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 2. BUCKET STORAGE PER CUSTOM ASSETS (Pezzi 3D)
-- ============================================
-- Vai su Supabase Dashboard > Storage > Create Bucket
-- Nome: custom_assets
-- Pubblico: SÌ
-- File size limit: 10MB
-- Allowed MIME types: model/*, application/octet-stream

-- Policy RLS per custom_assets:
CREATE POLICY "Custom assets are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'custom_assets');

CREATE POLICY "Users can upload their own custom assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'custom_assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own custom assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'custom_assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own custom assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'custom_assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 3. VERIFICA TABELLA PROFILES
-- ============================================
-- La tabella profiles dovrebbe già esistere, ma verifica che abbia questi campi:

-- Se la tabella non esiste, creala:
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  avatar_url TEXT,
  active_assets JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Abilita RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Tutti possono leggere i profili pubblici
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

-- Policy: Gli utenti possono aggiornare solo il proprio profilo
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Policy: Gli utenti possono inserire solo il proprio profilo
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================
-- 4. VERIFICA TABELLA CAREER_PROGRESS
-- ============================================
CREATE TABLE IF NOT EXISTS public.career_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  chess_level INTEGER DEFAULT 1,
  checkers_level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  current_game_state JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Abilita RLS
ALTER TABLE public.career_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Gli utenti possono vedere solo il proprio progresso
CREATE POLICY "Users can view own career progress"
ON public.career_progress FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Gli utenti possono aggiornare solo il proprio progresso
CREATE POLICY "Users can update own career progress"
ON public.career_progress FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Gli utenti possono inserire solo il proprio progresso
CREATE POLICY "Users can insert own career progress"
ON public.career_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 5. TRIGGER PER CREARE PROFILO AUTOMATICAMENTE
-- ============================================
-- Questo trigger crea automaticamente un profilo quando un utente si registra

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
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crea il trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 6. INDICI PER PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_career_progress_user_id ON public.career_progress(user_id);

-- ============================================
-- 7. VERIFICA CONFIGURAZIONE
-- ============================================
-- Esegui queste query per verificare che tutto sia configurato correttamente:

-- Verifica buckets
SELECT * FROM storage.buckets WHERE name IN ('avatars', 'custom_assets');

-- Verifica tabelle
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'career_progress');

-- Verifica policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('profiles', 'career_progress');

-- ============================================
-- FINE SETUP
-- ============================================
-- Dopo aver eseguito questi script, l'applicazione dovrebbe funzionare correttamente!
