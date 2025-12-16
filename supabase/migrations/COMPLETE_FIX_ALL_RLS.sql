-- ============================================
-- COMPLETE FIX - ALL ISSUES
-- This fixes EVERYTHING preventing public listings from showing
-- ============================================

-- ============================================
-- PART 1: FIX CATEGORIES TABLE RLS
-- ============================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Drop existing category policies
DO $$ 
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'categories') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.categories';
    END LOOP;
END $$;

-- Allow EVERYONE to read categories (needed for frontend category lookup)
CREATE POLICY "public_read_categories"
  ON public.categories FOR SELECT
  TO public
  USING (true);

-- ============================================
-- PART 2: FIX LISTINGS TABLE RLS
-- ============================================

-- Drop ALL existing listing policies
DO $$ 
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'listings') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.listings';
    END LOOP;
END $$;

-- Update status constraint to include 'approved'
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_status_check;
ALTER TABLE public.listings ADD CONSTRAINT listings_status_check 
  CHECK (status IN ('pending', 'active', 'approved', 'sold', 'expired', 'rejected', 'draft'));

-- Create clean, simple policies

-- 1. PUBLIC can view approved and active listings
CREATE POLICY "public_view_listings"
  ON public.listings FOR SELECT
  TO public
  USING (status IN ('active', 'approved'));

-- 2. AUTHENTICATED users can view more
CREATE POLICY "authenticated_view_listings"
  ON public.listings FOR SELECT
  TO authenticated
  USING (status IN ('active', 'approved', 'pending') OR auth.uid() = user_id);

-- 3. Users can INSERT their own listings
CREATE POLICY "users_insert_listings"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 4. Users can UPDATE their own listings
CREATE POLICY "users_update_own"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Users can DELETE their own listings
CREATE POLICY "users_delete_own"
  ON public.listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. Admins can do EVERYTHING
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

-- ============================================
-- PART 3: FIX PROFILES TABLE RLS
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing profile policies
DO $$ 
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.profiles';
    END LOOP;
END $$;

-- Allow public to read profiles (needed for admin checks in RLS policies)
CREATE POLICY "public_read_profiles"
  ON public.profiles FOR SELECT
  TO public
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "users_update_own_profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- PART 4: ENSURE CATEGORIES EXIST
-- ============================================

INSERT INTO public.categories (name, slug, icon, color, display_order)
VALUES 
  ('Cars', 'cars', 'DirectionsCar', '#1E88E5', 1),
  ('Homes', 'homes', 'Home', '#43A047', 2),
  ('Jobs', 'jobs', 'Work', '#E53935', 3),
  ('Tenders', 'tenders', 'Gavel', '#FB8C00', 4)
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    display_order = EXCLUDED.display_order;

-- ============================================
-- PART 5: VERIFICATION
-- ============================================

-- Show categories
SELECT 
  '=== CATEGORIES ===' as section,
  id, name, slug
FROM public.categories
ORDER BY display_order;

-- Show listings by status
SELECT 
  '=== LISTINGS BY STATUS ===' as section,
  status,
  COUNT(*) as count
FROM public.listings
GROUP BY status;

-- Show listings with categories (with type cast to handle TEXT vs UUID)
SELECT 
  '=== LISTINGS WITH CATEGORIES ===' as section,
  c.name as category,
  l.status,
  COUNT(*) as count
FROM public.listings l
JOIN public.categories c ON l.category_id::uuid = c.id
GROUP BY c.name, l.status
ORDER BY c.name, l.status;

-- Test anonymous access to categories
SET ROLE anon;
SELECT 
  '=== ANON CAN SEE CATEGORIES ===' as section,
  COUNT(*) as count
FROM public.categories;
RESET ROLE;

-- Test anonymous access to listings
SET ROLE anon;
SELECT 
  '=== ANON CAN SEE LISTINGS ===' as section,
  COUNT(*) as count
FROM public.listings;
RESET ROLE;

-- Show all policies
SELECT 
  '=== ALL POLICIES ===' as section,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename IN ('categories', 'listings', 'profiles')
ORDER BY tablename, policyname;
