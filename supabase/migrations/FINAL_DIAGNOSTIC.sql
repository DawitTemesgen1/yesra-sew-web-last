-- ============================================
-- FINAL DIAGNOSTIC - WHY ARE LISTINGS HIDDEN?
-- ============================================

-- 1. Check if ANY listings exist with correct status
SELECT 
  '=== 1. LISTING STATUS COUNTS ===' as check_name,
  status,
  COUNT(*) as count
FROM public.listings
GROUP BY status;

-- 2. Check if ANY categories exist
SELECT 
  '=== 2. CATEGORIES ===' as check_name,
  id, name, slug
FROM public.categories;

-- 3. Check if listings map to valid categories
SELECT 
  '=== 3. LISTING-CATEGORY MAPPING ===' as check_name,
  l.title,
  l.status,
  l.category_id,
  c.name as category_name
FROM public.listings l
LEFT JOIN public.categories c ON l.category_id::uuid = c.id
WHERE l.status IN ('active', 'approved');

-- 4. SIMULATE PUBLIC USER (ANON) ACCESS
-- This is what the frontend sees
SET LOCAL ROLE anon;

SELECT 
  '=== 4. PUBLIC VIEW - CATEGORIES ===' as check_name,
  COUNT(*) as visible_count
FROM public.categories;

SELECT 
  '=== 5. PUBLIC VIEW - LISTINGS ===' as check_name,
  status,
  COUNT(*) as visible_count
FROM public.listings
WHERE status IN ('active', 'approved')
GROUP BY status;

RESET ROLE;

-- 5. Check RLS Policies again
SELECT 
  '=== 6. RLS POLICIES ===' as check_name,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'listings';
