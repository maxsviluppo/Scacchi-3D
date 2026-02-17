-- =============================================
-- AGGIORNAMENTO PROFILI PER SUPPORTO KIT
-- =============================================

-- Aggiunge la colonna per memorizzare il kit attualmente in uso dall'utente
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS current_kit_id TEXT REFERENCES public.asset_collections(id) ON DELETE SET NULL;

-- Commento descrittivo
COMMENT ON COLUMN public.profiles.current_kit_id IS 'ID del kit di asset 3D selezionato dall''utente dallo shop';
