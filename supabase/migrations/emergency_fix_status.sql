-- ============================================
-- EMERGENCY FIX: Check and Fix Listing Status Values
-- ============================================

-- First, let's see what status values currently exist
SELECT DISTINCT status, COUNT(*) as count
FROM public.listings
GROUP BY status
ORDER BY count DESC;

-- Check the specific listing that's failing
SELECT id, title, status, created_at
FROM public.listings
WHERE id = '627c24b5-760c-4f8a-ae1d-d5759b97df49';

-- Drop the constraint temporarily
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_status_check;

-- Update ALL listings to have valid status values
UPDATE public.listings
SET status = CASE
  WHEN status IS NULL THEN 'pending'
  WHEN status = 'approved' THEN 'active'
  WHEN status = 'published' THEN 'active'
  WHEN status = 'verified' THEN 'active'
  WHEN status IN ('pending', 'active', 'sold', 'expired', 'rejected', 'draft') THEN status
  ELSE 'pending'
END;

-- Verify all statuses are now valid
SELECT DISTINCT status, COUNT(*) as count
FROM public.listings
GROUP BY status
ORDER BY count DESC;

-- Re-add the constraint with the correct values
ALTER TABLE public.listings ADD CONSTRAINT listings_status_check 
  CHECK (status IN ('pending', 'active', 'sold', 'expired', 'rejected', 'draft'));

-- Test update on the specific listing
UPDATE public.listings
SET status = 'active'
WHERE id = '627c24b5-760c-4f8a-ae1d-d5759b97df49';

-- Verify it worked
SELECT id, title, status
FROM public.listings
WHERE id = '627c24b5-760c-4f8a-ae1d-d5759b97df49';
