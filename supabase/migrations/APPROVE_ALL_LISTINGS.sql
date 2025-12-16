-- ============================================
-- APPROVE ALL PENDING LISTINGS
-- This will make all your pending listings visible on public pages
-- ============================================

-- Show current status counts
SELECT 
  '=== BEFORE UPDATE ===' as info,
  status,
  COUNT(*) as count
FROM public.listings
GROUP BY status;

-- Approve all pending listings
UPDATE public.listings 
SET status = 'approved' 
WHERE status = 'pending';

-- Show updated status counts
SELECT 
  '=== AFTER UPDATE ===' as info,
  status,
  COUNT(*) as count
FROM public.listings
GROUP BY status;

-- Show the approved listings
SELECT 
  '=== APPROVED LISTINGS ===' as info,
  id,
  title,
  status,
  category_id,
  created_at
FROM public.listings
WHERE status = 'approved'
ORDER BY created_at DESC;
