-- ============================================
-- Supabase Minimal Setup - Only Missing Tables
-- Run this if the full migration fails
-- ============================================

-- Enable UUID extension (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. LISTINGS TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL CHECK (category_id IN ('1', '2', '3', '4')),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  city TEXT,
  specific_location TEXT,
  type TEXT DEFAULT 'sale' CHECK (type IN ('sale', 'rent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'rejected', 'closed')),
  images TEXT[], -- Array of image URLs
  video_url TEXT,
  
  -- Homes specific fields (category_id = '1')
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_sqft INTEGER,
  property_type TEXT,
  
  -- Cars specific fields (category_id = '2')
  make TEXT,
  model TEXT,
  year INTEGER,
  transmission TEXT,
  fuel TEXT,
  mileage INTEGER,
  condition TEXT,
  
  -- Jobs specific fields (category_id = '3')
  job_type TEXT,
  experience TEXT,
  salary_range TEXT,
  company TEXT,
  
  -- Tenders specific fields (category_id = '4')
  deadline DATE,
  tender_type TEXT,
  organization TEXT,
  
  -- Engagement metrics
  views INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON public.listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON public.listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_city ON public.listings(city);

-- Enable Row Level Security
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Approved listings are viewable by everyone" ON public.listings;
DROP POLICY IF EXISTS "Users can insert their own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can update own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON public.listings;

-- Listings policies
CREATE POLICY "Approved listings are viewable by everyone"
  ON public.listings FOR SELECT
  USING (status IN ('approved', 'active') OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own listings"
  ON public.listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings"
  ON public.listings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings"
  ON public.listings FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 2. FAVORITES TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON public.favorites(listing_id);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;

CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. STORAGE BUCKET FOR LISTINGS
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('listings', 'listings', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Anyone can view listing files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload listing files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own listing files" ON storage.objects;

-- Storage policies for listings bucket
CREATE POLICY "Anyone can view listing files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listings');

CREATE POLICY "Authenticated users can upload listing files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listings' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own listing files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'listings' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- 4. TRIGGER FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_listings_updated_at ON public.listings;

CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- You should now have:
-- ✅ listings table
-- ✅ favorites table
-- ✅ listings storage bucket
-- ✅ All necessary policies
