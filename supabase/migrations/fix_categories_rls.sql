-- ============================================
-- FIX CATEGORIES TABLE RLS
-- The frontend can't read categories due to RLS blocking
-- ============================================

-- Check current policies on categories
SELECT 
  '=== CURRENT CATEGORY POLICIES ===' as info,
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies
WHERE tablename = 'categories';

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "public_read_categories" ON public.categories;
DROP POLICY IF EXISTS "anyone_read_categories" ON public.categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;

-- Create simple policy: EVERYONE can read categories
CREATE POLICY "public_read_categories"
  ON public.categories FOR SELECT
  TO public
  USING (true);

-- Verify
SELECT 
  '=== UPDATED CATEGORY POLICIES ===' as info,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'categories';

-- Test anonymous access
SET ROLE anon;
SELECT 
  '=== ANON CAN SEE CATEGORIES ===' as info,
  COUNT(*) as count,
  string_agg(name, ', ') as category_names
FROM public.categories;
RESET ROLE;
