-- ============================================
-- EMERGENCY FIX: Force Public Listings to Show
-- This will completely reset and fix all RLS policies
-- ============================================

-- STEP 1: Drop ALL existing policies on listings
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'listings') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.listings';
    END LOOP;
END $$;

-- STEP 2: Update status constraint to include 'approved'
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_status_check;
ALTER TABLE public.listings ADD CONSTRAINT listings_status_check 
  CHECK (status IN ('pending', 'active', 'approved', 'sold', 'expired', 'rejected', 'draft'));

-- STEP 3: Create SIMPLE, WORKING policies

-- Policy 1: PUBLIC can view approved and active listings (NO EXPIRATION CHECK)
CREATE POLICY "public_view_listings"
  ON public.listings FOR SELECT
  TO public
  USING (status IN ('active', 'approved'));

-- Policy 2: AUTHENTICATED users can view approved, active, and pending listings
CREATE POLICY "authenticated_view_listings"
  ON public.listings FOR SELECT
  TO authenticated
  USING (status IN ('active', 'approved', 'pending') OR auth.uid() = user_id);

-- Policy 3: Users can INSERT their own listings
CREATE POLICY "users_insert_listings"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can UPDATE their own listings
CREATE POLICY "users_update_own"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 5: Users can DELETE their own listings
CREATE POLICY "users_delete_own"
  ON public.listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 6: Admins can do EVERYTHING
CREATE POLICY "admins_all_access"
  ON public.listings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- STEP 4: Ensure RLS is enabled
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- STEP 5: Fix profiles table RLS for admin checks
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_read_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_read_profiles_for_admin_check" ON public.profiles;

-- Allow public to read basic profile info (needed for RLS checks)
CREATE POLICY "public_read_profiles"
  ON public.profiles FOR SELECT
  TO public
  USING (true);

-- STEP 6: Verification
SELECT 
  '=== POLICIES CREATED ===' as info,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'listings'
ORDER BY policyname;

SELECT 
  '=== LISTING COUNTS ===' as info,
  status,
  COUNT(*) as count
FROM public.listings
GROUP BY status;

-- STEP 7: Test public access (run as anon user)
SET ROLE anon;
SELECT 
  '=== PUBLIC CAN SEE ===' as info,
  COUNT(*) as visible_count
FROM public.listings;
RESET ROLE;
