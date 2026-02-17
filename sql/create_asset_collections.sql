-- ============================================
-- TABELLA ASSET_COLLECTIONS PER GESTIONE KIT
-- ============================================

-- Tabella per memorizzare i kit 3D (collezioni di asset)
CREATE TABLE IF NOT EXISTS public.asset_collections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('chess', 'checkers')),
    price_eur NUMERIC(10, 2) DEFAULT 0,
    assets JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_asset_collections_type ON public.asset_collections(type);
CREATE INDEX IF NOT EXISTS idx_asset_collections_public ON public.asset_collections(is_public);
CREATE INDEX IF NOT EXISTS idx_asset_collections_created ON public.asset_collections(created_at DESC);

-- RLS Policies (Admin può fare tutto, utenti possono solo leggere kit pubblici)
ALTER TABLE public.asset_collections ENABLE ROW LEVEL SECURITY;

-- Policy: Tutti possono leggere kit pubblici
CREATE POLICY "Public kits are viewable by everyone"
ON public.asset_collections FOR SELECT
USING (is_public = true);

-- Policy: Solo admin può inserire/modificare/eliminare
-- NOTA: Configurare ruolo admin su Supabase o usare service_role key
CREATE POLICY "Admin can manage all kits"
ON public.asset_collections FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');

-- Commento descrittivo
COMMENT ON TABLE public.asset_collections IS 'Collezioni di asset 3D (kit) per scacchi e dama';
COMMENT ON COLUMN public.asset_collections.assets IS 'JSONB contenente mapping id_pezzo -> URL (es: {"p_w": "https://...", "board": "https://..."})';
