-- ============================================
-- COMPREHENSIVE DIAGNOSTIC - Find the EXACT problem
-- Run this entire script and share ALL results
-- ============================================

-- 1. Check if categories exist and their exact names/slugs
SELECT 
  '=== CATEGORIES TABLE ===' as section,
  id, 
  name, 
  slug,
  description
FROM public.categories
ORDER BY name;

-- 2. Check listings and their category_id
SELECT 
  '=== LISTINGS TABLE ===' as section,
  l.id,
  l.title,
  l.status,
  l.category_id,
  c.name as category_name,
  c.slug as category_slug
FROM public.listings l
LEFT JOIN public.categories c ON l.category_id = c.id
ORDER BY l.created_at DESC
LIMIT 10;

-- 3. Count listings by status
SELECT 
  '=== LISTINGS BY STATUS ===' as section,
  status,
  COUNT(*) as count
FROM public.listings
GROUP BY status
ORDER BY status;

-- 4. Check RLS policies on listings
SELECT 
  '=== RLS POLICIES ===' as section,
  policyname,
  cmd,
  roles,
  qual as using_condition
FROM pg_policies
WHERE tablename = 'listings'
ORDER BY policyname;

-- 5. Test what anonymous users can see
SET ROLE anon;
SELECT 
  '=== WHAT ANON CAN SEE ===' as section,
  COUNT(*) as visible_count,
  string_agg(DISTINCT status, ', ') as statuses_visible
FROM public.listings;
RESET ROLE;

-- 6. Test what authenticated users can see
SET ROLE authenticated;
SELECT 
  '=== WHAT AUTHENTICATED CAN SEE ===' as section,
  COUNT(*) as visible_count,
  string_agg(DISTINCT status, ', ') as statuses_visible
FROM public.listings;
RESET ROLE;

-- 7. Check if there are any listings with matching categories
SELECT 
  '=== LISTINGS WITH HOMES CATEGORY ===' as section,
  COUNT(*) as count
FROM public.listings l
JOIN public.categories c ON l.category_id = c.id
WHERE LOWER(c.name) = 'homes' OR LOWER(c.slug) = 'homes';

SELECT 
  '=== LISTINGS WITH CARS CATEGORY ===' as section,
  COUNT(*) as count
FROM public.listings l
JOIN public.categories c ON l.category_id = c.id
WHERE LOWER(c.name) = 'cars' OR LOWER(c.slug) = 'cars';

-- 8. Check the exact category IDs
SELECT 
  '=== CATEGORY IDS ===' as section,
  name,
  slug,
  id,
  (SELECT COUNT(*) FROM public.listings WHERE category_id = categories.id) as listing_count
FROM public.categories
ORDER BY name;
