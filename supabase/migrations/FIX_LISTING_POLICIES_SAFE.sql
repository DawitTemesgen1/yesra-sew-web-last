-- Safe fix for Listing Policies with Type Safety (No intrusive drops)

-- 1. Create a safe admin check function (new name to avoid conflicts)
-- logic: compares IDs as text to handle potential uuid vs text mismatches
CREATE OR REPLACE FUNCTION is_admin_consistent()
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

-- 2. Drop ONLY the specific listing policies we need to fix
DROP POLICY IF EXISTS "Admins can view all listings" ON listings;
DROP POLICY IF EXISTS "Admins can update all listings" ON listings;
DROP POLICY IF EXISTS "Admins can delete all listings" ON listings;
DROP POLICY IF EXISTS "Users can create listings" ON listings;
-- Leaving "Users can view their own listings" alone if it exists and works for you

-- 3. Re-create policies with explicit type casting (::text) to resolve "operator does not exist: text = uuid"
-- This ensures user_id (whether text or uuid) can be compared to auth.uid()

CREATE POLICY "Admins can view all listings"
ON listings FOR SELECT
TO authenticated
USING (
  is_admin_consistent() 
  OR user_id::text = auth.uid()::text
  OR status IN ('active', 'approved')
);

CREATE POLICY "Admins can update all listings"
ON listings FOR UPDATE
TO authenticated
USING (is_admin_consistent() OR user_id::text = auth.uid()::text);

CREATE POLICY "Admins can delete all listings"
ON listings FOR DELETE
TO authenticated
USING (is_admin_consistent() OR user_id::text = auth.uid()::text);

CREATE POLICY "Users can create listings"
ON listings FOR INSERT
TO authenticated
WITH CHECK (
  user_id::text = auth.uid()::text 
  AND (
    is_admin_consistent()
    OR
    -- Restricted Category Check
    (
      category_id IN (SELECT id FROM categories WHERE restricted = true)
      AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id::text = auth.uid()::text 
        AND account_type = 'company' 
        AND verified = true
      )
    )
    OR
    -- Public Category Check
    category_id IN (
      SELECT id FROM categories WHERE restricted IS NOT TRUE
    )
  )
);
