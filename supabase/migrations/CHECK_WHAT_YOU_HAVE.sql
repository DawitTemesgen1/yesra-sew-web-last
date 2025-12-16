-- ============================================
-- CHECK WHAT'S IN YOUR DATABASE
-- Run this to see what data you actually have
-- ============================================

-- 1. Check categories
SELECT 
  '=== CATEGORIES ===' as info,
  id, name, slug
FROM public.categories;

-- 2. Check ALL listings (regardless of status)
SELECT 
  '=== ALL LISTINGS ===' as info,
  id,
  title,
  status,
  category_id,
  created_at
FROM public.listings
ORDER BY created_at DESC
LIMIT 20;

-- 3. Count listings by status
SELECT 
  '=== COUNT BY STATUS ===' as info,
  status,
  COUNT(*) as count
FROM public.listings
GROUP BY status;

-- 4. Check if any listings have 'approved' or 'active' status
SELECT 
  '=== APPROVED/ACTIVE LISTINGS ===' as info,
  COUNT(*) as count
FROM public.listings
WHERE status IN ('approved', 'active');

-- 5. If you have pending listings, let's approve them
-- UNCOMMENT THE LINES BELOW TO AUTO-APPROVE ALL PENDING LISTINGS:

-- UPDATE public.listings 
-- SET status = 'approved' 
-- WHERE status = 'pending';

-- SELECT 'Updated ' || COUNT(*) || ' listings to approved' as result
-- FROM public.listings 
-- WHERE status = 'approved';
