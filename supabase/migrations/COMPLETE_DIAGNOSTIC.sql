-- ============================================
-- COMPLETE DIAGNOSTIC - RUN THIS IN SUPABASE
-- ============================================

-- 1. Check if RLS is enabled
SELECT 
  '=== RLS STATUS ===' as info,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('categories', 'listings', 'profiles')
  AND schemaname = 'public';

-- 2. Check all RLS policies
SELECT 
  '=== ALL RLS POLICIES ===' as info,
  tablename,
  policyname,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE tablename IN ('categories', 'listings', 'profiles')
ORDER BY tablename, policyname;

-- 3. Check categories
SELECT 
  '=== CATEGORIES ===' as info,
  id,
  name,
  slug
FROM public.categories
ORDER BY name;

-- 4. Check listings by status
SELECT 
  '=== LISTINGS BY STATUS ===' as info,
  status,
  COUNT(*) as count
FROM public.listings
GROUP BY status
ORDER BY status;

-- 5. Check sample listings
SELECT 
  '=== SAMPLE LISTINGS ===' as info,
  id,
  title,
  status,
  category_id,
  created_at
FROM public.listings
ORDER BY created_at DESC
LIMIT 10;

-- 6. Test public access to categories (this simulates what frontend sees)
SET LOCAL ROLE anon;
SELECT 
  '=== PUBLIC CAN SEE CATEGORIES ===' as info,
  COUNT(*) as count
FROM public.categories;
RESET ROLE;

-- 7. Test public access to listings (this simulates what frontend sees)
SET LOCAL ROLE anon;
SELECT 
  '=== PUBLIC CAN SEE LISTINGS ===' as info,
  status,
  COUNT(*) as count
FROM public.listings
GROUP BY status;
RESET ROLE;
