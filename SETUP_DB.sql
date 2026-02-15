-- Esegui questo script nell'editor SQL di Supabase per aggiornare la tabella profiles

-- 1. Aggiungi colonna avatar_url se manca
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url text;

-- 2. Aggiungi colonna nickname se manca
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS nickname text;

-- 3. Assicurati che le policy di Storage siano corrette per gli avatar
-- (Questo è solo un commento, devi verificare le policy nello Storage di Supabase:
-- Bucket 'avatars' -> Policies -> Enable for Authenticated users: SELECT, INSERT, UPDATE)
