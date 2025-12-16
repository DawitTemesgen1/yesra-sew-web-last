-- ============================================
-- FIX PUBLIC LISTINGS VISIBILITY
-- This fixes the issue where approved listings don't show on public pages
-- ============================================

-- Drop the old public read policy
DROP POLICY IF EXISTS "public_read_listings" ON public.listings;

-- Create new policy that includes 'approved' status
CREATE POLICY "public_read_listings"
  ON public.listings FOR SELECT
  USING (status IN ('active', 'approved', 'pending'));

-- Verify the fix
SELECT 
  'Policy Updated' as status,
  policyname, 
  cmd,
  qual as using_expression
FROM pg_policies
WHERE tablename = 'listings' 
  AND policyname = 'public_read_listings';

-- Check how many listings are now visible
SELECT 
  status,
  COUNT(*) as count
FROM public.listings
GROUP BY status
ORDER BY status;
