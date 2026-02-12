-- Database Schema for Scacchi 3D Evolution

-- 1. Table for collections of 3D pieces (Marketplace)
CREATE TABLE IF NOT EXISTS public.asset_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    author_id UUID REFERENCES auth.users(id),
    author_name TEXT NOT NULL,
    price_eur DECIMAL(10, 2) DEFAULT 0.00,
    is_public BOOLEAN DEFAULT false,
    preview_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table for individual 3D models within a collection
CREATE TABLE IF NOT EXISTS public.pieces_3d (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID REFERENCES public.asset_collections(id) ON DELETE CASCADE,
    piece_type TEXT NOT NULL, -- 'K', 'Q', 'B', 'N', 'R', 'P'
    storage_url TEXT NOT NULL, -- Path in Supabase Storage
    scale_multiplier FLOAT DEFAULT 1.0,
    y_offset FLOAT DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Table for tracking which users own which collections
CREATE TABLE IF NOT EXISTS public.user_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    collection_id UUID REFERENCES public.asset_collections(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, collection_id)
);

-- RLS (Row Level Security) - Basic setup
ALTER TABLE public.asset_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pieces_3d ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_assets ENABLE ROW LEVEL SECURITY;

-- Everyone can see public collections
CREATE POLICY "Public collections are viewable by everyone" 
ON public.asset_collections FOR SELECT USING (is_public = true);

-- Owners/Authors can manage their own collections
CREATE POLICY "Authors can manage their collections" 
ON public.asset_collections FOR ALL USING (auth.uid() = author_id);
