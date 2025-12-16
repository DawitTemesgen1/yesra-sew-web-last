-- ============================================
-- FIX RLS POLICIES FOR TESTING
-- ============================================
-- This script relaxes the RLS policies to allow ANY authenticated user
-- to manage categories and templates. This fixes the "violates row-level security policy" error.
-- ============================================

-- 1. CATEGORIES
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Authenticated users can manage categories"
  ON public.categories FOR ALL
  USING (auth.role() = 'authenticated');

-- 2. POST TEMPLATES
DROP POLICY IF EXISTS "Admins can manage templates" ON public.post_templates;
CREATE POLICY "Authenticated users can manage templates"
  ON public.post_templates FOR ALL
  USING (auth.role() = 'authenticated');

-- 3. TEMPLATE STEPS
DROP POLICY IF EXISTS "Admins can manage template steps" ON public.template_steps;
CREATE POLICY "Authenticated users can manage template steps"
  ON public.template_steps FOR ALL
  USING (auth.role() = 'authenticated');

-- 4. TEMPLATE FIELDS
DROP POLICY IF EXISTS "Admins can manage template fields" ON public.template_fields;
CREATE POLICY "Authenticated users can manage template fields"
  ON public.template_fields FOR ALL
  USING (auth.role() = 'authenticated');

-- 5. LISTINGS (Ensure users can post)
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can insert listings" ON public.listings;
CREATE POLICY "Authenticated users can insert listings"
  ON public.listings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own listings" ON public.listings;
CREATE POLICY "Users can update own listings"
  ON public.listings FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own listings" ON public.listings;
CREATE POLICY "Users can delete own listings"
  ON public.listings FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view listings" ON public.listings;
CREATE POLICY "Anyone can view listings"
  ON public.listings FOR SELECT
  USING (true);

-- 6. STORAGE POLICIES (Ensure uploads work)
DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
CREATE POLICY "Authenticated users can upload listing images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-images'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Authenticated users can upload listing videos" ON storage.objects;
CREATE POLICY "Authenticated users can upload listing videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-videos'
    AND auth.role() = 'authenticated'
  );
