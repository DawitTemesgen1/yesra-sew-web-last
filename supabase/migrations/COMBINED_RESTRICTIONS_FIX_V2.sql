-- Combined Migration: Dynamic Category Restrictions & RLS Policies & User Management (Fixed Types)

-- 1. Add 'restricted' column to categories table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'restricted') THEN
        ALTER TABLE categories ADD COLUMN restricted BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 2. Update existing restricted categories (Jobs, Tenders)
UPDATE categories 
SET restricted = true 
WHERE slug IN ('jobs', 'tenders', 'job', 'tender');

COMMENT ON COLUMN categories.restricted IS 'If true, only verified companies and admins can post to this category';

-- 3. Fix RLS policies for listings
-- Drop existing listing policies if they conflict
DROP POLICY IF EXISTS "Admins can view all listings" ON listings;
DROP POLICY IF EXISTS "Admins can update all listings" ON listings;
DROP POLICY IF EXISTS "Admins can delete all listings" ON listings;
DROP POLICY IF EXISTS "Users can create listings" ON listings;
DROP POLICY IF EXISTS "Users can view their own listings" ON listings;
DROP POLICY IF EXISTS "Users can create listings with category restrictions" ON listings;

-- Helper function to safely check if user is admin (handles type casting)
CREATE OR REPLACE FUNCTION is_admin_safe()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id::text = auth.uid()::text 
    AND role = 'admin'
  );
END;
$$;

-- Allow admins to view ALL listings (including pending)
CREATE POLICY "Admins can view all listings"
ON listings FOR SELECT
TO authenticated
USING (
  is_admin_safe() 
  OR user_id::text = auth.uid()::text  -- Cast both to text to avoid UUID/Text mismatch
  OR status IN ('active', 'approved')
);

-- Allow admins to update any listing (for approval/rejection)
CREATE POLICY "Admins can update all listings"
ON listings FOR UPDATE
TO authenticated
USING (is_admin_safe() OR user_id::text = auth.uid()::text);

-- Allow admins to delete any listing
CREATE POLICY "Admins can delete all listings"
ON listings FOR DELETE
TO authenticated
USING (is_admin_safe() OR user_id::text = auth.uid()::text);

-- Allow authenticated users to insert listings with category restrictions
CREATE POLICY "Users can create listings"
ON listings FOR INSERT
TO authenticated
WITH CHECK (
  user_id::text = auth.uid()::text 
  AND (
    is_admin_safe()  -- Admins can post to any category
    OR
    -- For restricted categories, must be verified company
    (
      category_id IN (
        SELECT id FROM categories WHERE restricted = true
      )
      AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id::text = auth.uid()::text 
        AND account_type = 'company' 
        AND verified = true
      )
    )
    OR
    -- For non-restricted categories, any authenticated user can post
    category_id IN (
      SELECT id FROM categories WHERE (restricted = false OR restricted IS NULL)
    )
  )
);
