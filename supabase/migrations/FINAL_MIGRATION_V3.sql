-- FINAL MIGRATION V3: Robust Fix for Type Mismatches

-- 1. CLEANUP: Drop all existing policies and functions to start fresh
DROP POLICY IF EXISTS "Admins can view all listings" ON listings;
DROP POLICY IF EXISTS "Admins can update all listings" ON listings;
DROP POLICY IF EXISTS "Admins can delete all listings" ON listings;
DROP POLICY IF EXISTS "Users can create listings" ON listings;
DROP POLICY IF EXISTS "Users can view their own listings" ON listings;
DROP POLICY IF EXISTS "Users can create listings with category restrictions" ON listings;

-- Drop functions to ensure no old/bad versions exist
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS is_admin_safe();

-- 2. SCHEMA UPDATE: Add 'restricted' column safely
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'restricted') THEN
        ALTER TABLE categories ADD COLUMN restricted BOOLEAN DEFAULT false;
    END IF;
END $$;

UPDATE categories 
SET restricted = true 
WHERE slug IN ('jobs', 'tenders', 'job', 'tender');

-- 3. NEW HELPER FUNCTION: Safely checks admin status with explicit casting
CREATE OR REPLACE FUNCTION is_admin_safe()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Cast both ID and auth.uid() to text to ensure they match regardless of column type
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE CAST(id AS text) = CAST(auth.uid() AS text)
    AND role = 'admin'
  );
END;
$$;

-- 4. NEW POLICIES: With explicit casting for all comparisons

-- Allow admins to view ALL listings (including pending)
CREATE POLICY "Admins can view all listings"
ON listings FOR SELECT
TO authenticated
USING (
  is_admin_safe() 
  OR CAST(user_id AS text) = CAST(auth.uid() AS text)
  OR status IN ('active', 'approved')
);

-- Allow admins to update any listing
CREATE POLICY "Admins can update all listings"
ON listings FOR UPDATE
TO authenticated
USING (
  is_admin_safe() 
  OR CAST(user_id AS text) = CAST(auth.uid() AS text)
);

-- Allow admins to delete any listing
CREATE POLICY "Admins can delete all listings"
ON listings FOR DELETE
TO authenticated
USING (
  is_admin_safe() 
  OR CAST(user_id AS text) = CAST(auth.uid() AS text)
);

-- Allow authenticated users to insert listings with category restrictions
CREATE POLICY "Users can create listings"
ON listings FOR INSERT
TO authenticated
WITH CHECK (
  CAST(user_id AS text) = CAST(auth.uid() AS text)
  AND (
    is_admin_safe()
    OR
    -- For restricted categories, must be verified company
    (
      category_id IN (
        SELECT id FROM categories WHERE restricted = true
      )
      AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE CAST(id AS text) = CAST(auth.uid() AS text)
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
