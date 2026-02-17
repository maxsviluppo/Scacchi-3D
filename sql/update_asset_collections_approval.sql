-- =============================================
-- AGGIORNAMENTO ASSET_COLLECTIONS PER APPROVAZIONI E AUTORI
-- =============================================

-- Aggiunge colonne per la gestione degli autori e del flusso di approvazione
ALTER TABLE public.asset_collections 
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT false;

-- Indice per filtrare velocemente i kit in attesa di approvazione
CREATE INDEX IF NOT EXISTS idx_asset_collections_status ON public.asset_collections(status) WHERE status = 'pending';

-- Aggiorna i kit esistenti come ufficiali e approvati
UPDATE public.asset_collections SET is_official = true, status = 'approved' WHERE author_id IS NULL;

-- Commenti descrittivi
COMMENT ON COLUMN public.asset_collections.author_id IS 'ID dell''utente che ha creato il kit (NULL se ufficiale)';
COMMENT ON COLUMN public.asset_collections.status IS 'Stato di approvazione per i kit creati dagli utenti';
COMMENT ON COLUMN public.asset_collections.is_official IS 'Indica se il kit è un contenuto ufficiale di THE KING';
