-- ============================================
-- COMPREHENSIVE FIX FOR LISTING STATUS STANDARDIZATION
-- This ensures consistency between 'approved' and 'active' statuses
-- ============================================

-- Step 1: Update the status constraint to include 'approved'
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_status_check;
ALTER TABLE public.listings ADD CONSTRAINT listings_status_check 
  CHECK (status IN ('pending', 'active', 'approved', 'sold', 'expired', 'rejected', 'draft'));

-- Step 2: Optionally migrate 'approved' to 'active' for consistency
-- Uncomment the line below if you want to standardize on 'active' instead of 'approved'
-- UPDATE public.listings SET status = 'active' WHERE status = 'approved';

-- Step 3: Update RLS policies to handle both statuses
DROP POLICY IF EXISTS "public_read_listings" ON public.listings;

CREATE POLICY "public_read_listings"
  ON public.listings FOR SELECT
  USING (status IN ('active', 'approved'));

-- Step 4: Verify the changes
SELECT 
  'Status Distribution' as info,
  status,
  COUNT(*) as count
FROM public.listings
GROUP BY status
ORDER BY status;

SELECT 
  'RLS Policy' as info,
  policyname, 
  qual as policy_condition
FROM pg_policies
WHERE tablename = 'listings' 
  AND policyname = 'public_read_listings';
