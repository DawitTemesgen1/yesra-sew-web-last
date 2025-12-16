-- Fix RLS policies for listings to allow admin access and category restrictions

-- Drop existing listing policies if they conflict
DROP POLICY IF EXISTS "Admins can view all listings" ON listings;
DROP POLICY IF EXISTS "Admins can update all listings" ON listings;
DROP POLICY IF EXISTS "Admins can delete all listings" ON listings;
DROP POLICY IF EXISTS "Users can create listings" ON listings;
DROP POLICY IF EXISTS "Users can view their own listings" ON listings;

-- Allow admins to view ALL listings (including pending)
CREATE POLICY "Admins can view all listings"
ON listings FOR SELECT
TO authenticated
USING (
  is_admin() 
  OR user_id = auth.uid()  -- Users can see their own listings
  OR status IN ('active', 'approved')  -- Everyone can see approved listings
);

-- Allow admins to update any listing (for approval/rejection)
CREATE POLICY "Admins can update all listings"
ON listings FOR UPDATE
TO authenticated
USING (is_admin() OR user_id = auth.uid());

-- Allow admins to delete any listing
CREATE POLICY "Admins can delete all listings"
ON listings FOR DELETE
TO authenticated
USING (is_admin() OR user_id = auth.uid());

-- Allow authenticated users to insert listings with category restrictions
-- Restricted categories: Only verified companies and admins
-- Non-restricted categories: All authenticated users
CREATE POLICY "Users can create listings"
ON listings FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  AND (
    is_admin()  -- Admins can post to any category
    OR
    -- For restricted categories, must be verified company
    (
      category_id IN (
        SELECT id FROM categories WHERE restricted = true
      )
      AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND account_type = 'company' 
        AND verified = true
      )
    )
    OR
    -- For non-restricted categories, any authenticated user can post
    category_id IN (
      SELECT id FROM categories WHERE restricted = false OR restricted IS NULL
    )
  )
);
