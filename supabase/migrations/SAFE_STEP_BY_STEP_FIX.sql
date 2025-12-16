-- ============================================
-- SAFE FIX - Run this step by step
-- Copy each section one at a time if you get errors
-- ============================================

-- ============================================
-- STEP 1: FIX CATEGORIES TABLE (MOST IMPORTANT!)
-- ============================================

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Drop all category policies
DO $$ 
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'categories') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.categories';
    END LOOP;
END $$;

-- Create public read policy
CREATE POLICY "public_read_categories"
  ON public.categories FOR SELECT
  TO public
  USING (true);

-- Verify categories are readable
SET ROLE anon;
SELECT 'Categories visible to public:' as info, COUNT(*) as count FROM public.categories;
RESET ROLE;

-- ============================================
-- STEP 2: FIX LISTINGS TABLE
-- ============================================

-- Drop all listing policies
DO $$ 
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'listings') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.listings';
    END LOOP;
END $$;

-- Update status constraint
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_status_check;
ALTER TABLE public.listings ADD CONSTRAINT listings_status_check 
  CHECK (status IN ('pending', 'active', 'approved', 'sold', 'expired', 'rejected', 'draft'));

-- Create public read policy
CREATE POLICY "public_view_listings"
  ON public.listings FOR SELECT
  TO public
  USING (status IN ('active', 'approved'));

-- Create authenticated policies
CREATE POLICY "authenticated_view_listings"
  ON public.listings FOR SELECT
  TO authenticated
  USING (status IN ('active', 'approved', 'pending') OR auth.uid() = user_id);

CREATE POLICY "users_insert_listings"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own"
  ON public.listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admins_all_access"
  ON public.listings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Verify listings are readable
SET ROLE anon;
SELECT 'Listings visible to public:' as info, COUNT(*) as count FROM public.listings;
RESET ROLE;

-- ============================================
-- STEP 3: FIX PROFILES TABLE
-- ============================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop all profile policies
DO $$ 
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.profiles';
    END LOOP;
END $$;

-- Create public read policy
CREATE POLICY "public_read_profiles"
  ON public.profiles FOR SELECT
  TO public
  USING (true);

-- Create update policy
CREATE POLICY "users_update_own_profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- FINAL VERIFICATION
-- ============================================

-- Show all policies
SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename IN ('categories', 'listings', 'profiles')
ORDER BY tablename, policyname;

-- Test public access
SET ROLE anon;
SELECT 
  'PUBLIC ACCESS TEST' as test,
  (SELECT COUNT(*) FROM public.categories) as categories_count,
  (SELECT COUNT(*) FROM public.listings) as listings_count;
RESET ROLE;

-- Show listing distribution
SELECT 
  c.name as category,
  l.status,
  COUNT(*) as count
FROM public.listings l
JOIN public.categories c ON l.category_id = c.id
GROUP BY c.name, l.status
ORDER BY c.name, l.status;
