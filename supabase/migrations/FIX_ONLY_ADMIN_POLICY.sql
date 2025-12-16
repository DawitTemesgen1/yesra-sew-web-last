-- EMERGENCY FIX: Allow Admins to View/Edit All Listings (Ignoring Type Mismatches)

-- 1. Drop the specific policies blocking Admin access
DROP POLICY IF EXISTS "Admins can view all listings" ON listings;
DROP POLICY IF EXISTS "Admins can update all listings" ON listings;
DROP POLICY IF EXISTS "Admins can delete all listings" ON listings;

-- 2. Re-create Admin policies with explicit TEXT casting
-- This fixes the "operator does not exist: text = uuid" error

CREATE POLICY "Admins can view all listings"
ON listings FOR SELECT
TO authenticated
USING (
  -- Check if user has admin role (casting IDs to text to be safe)
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id::text = auth.uid()::text 
    AND role = 'admin'
  )
  OR 
  -- Users can always see their own stuff
  user_id::text = auth.uid()::text
  OR 
  -- Everyone sees approved posts
  status IN ('active', 'approved')
);

CREATE POLICY "Admins can update all listings"
ON listings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id::text = auth.uid()::text 
    AND role = 'admin'
  )
  OR user_id::text = auth.uid()::text
);

CREATE POLICY "Admins can delete all listings"
ON listings FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id::text = auth.uid()::text 
    AND role = 'admin'
  )
  OR user_id::text = auth.uid()::text
);
