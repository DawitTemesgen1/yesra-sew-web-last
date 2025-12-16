-- ============================================
-- COMPLETE FIX FOR ADMIN APPROVAL ISSUES
-- Run this entire script to fix all RLS and permission issues
-- ============================================

-- ============================================
-- PART 1: CLEAN UP OLD POLICIES
-- ============================================

-- Drop ALL existing policies on listings
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'listings') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.listings';
    END LOOP;
END $$;

-- ============================================
-- PART 2: FIX TABLE STRUCTURE
-- ============================================

-- Drop problematic constraints
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_category_id_check;
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_type_check;
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_status_check;

-- Ensure all columns exist
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id);
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.post_templates(id);
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS media_urls JSONB DEFAULT '[]';
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS video_urls TEXT[];
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Update existing data
UPDATE public.listings 
SET status = 'pending' 
WHERE status IS NULL OR status NOT IN ('pending', 'active', 'sold', 'expired', 'rejected', 'draft');

-- Make columns flexible
ALTER TABLE public.listings ALTER COLUMN title DROP NOT NULL;
ALTER TABLE public.listings ALTER COLUMN title SET DEFAULT 'Untitled Listing';
ALTER TABLE public.listings ALTER COLUMN description DROP NOT NULL;
ALTER TABLE public.listings ALTER COLUMN price DROP NOT NULL;
ALTER TABLE public.listings ALTER COLUMN price SET DEFAULT 0;

-- Add status constraint
ALTER TABLE public.listings ADD CONSTRAINT listings_status_check 
  CHECK (status IN ('pending', 'active', 'sold', 'expired', 'rejected', 'draft'));

-- ============================================
-- PART 3: CREATE NEW RLS POLICIES (SIMPLIFIED)
-- ============================================

-- Enable RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view active/pending listings
CREATE POLICY "public_read_listings"
  ON public.listings FOR SELECT
  USING (status IN ('active', 'pending'));

-- Policy 2: Users can view their own listings (any status)
CREATE POLICY "users_read_own_listings"
  ON public.listings FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 3: Authenticated users can insert their own listings
CREATE POLICY "users_insert_listings"
  ON public.listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can update their own listings
CREATE POLICY "users_update_own_listings"
  ON public.listings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 5: Users can delete their own listings
CREATE POLICY "users_delete_own_listings"
  ON public.listings FOR DELETE
  USING (auth.uid() = user_id);

-- Policy 6: Admins can SELECT everything
CREATE POLICY "admins_select_all_listings"
  ON public.listings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Policy 7: Admins can UPDATE everything
CREATE POLICY "admins_update_all_listings"
  ON public.listings FOR UPDATE
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

-- Policy 8: Admins can DELETE everything
CREATE POLICY "admins_delete_all_listings"
  ON public.listings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- PART 4: FIX PROFILES TABLE RLS
-- ============================================

-- Ensure profiles table allows reading for admin checks
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Allow users to read their own profile
CREATE POLICY "users_read_own_profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow authenticated users to read profiles for admin checks
CREATE POLICY "authenticated_read_profiles_for_admin_check"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "users_update_own_profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- PART 5: CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_listings_user_id ON public.listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_category_template ON public.listings(category_id, template_id);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================
-- PART 6: VERIFICATION
-- ============================================

-- Check current user
SELECT 
  'Current User' as info,
  auth.uid() as user_id,
  (SELECT email FROM public.profiles WHERE id = auth.uid()) as email,
  (SELECT role FROM public.profiles WHERE id = auth.uid()) as role;

-- Check policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename IN ('listings', 'profiles')
ORDER BY tablename, policyname;

-- Check if current user is admin
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    ) THEN 'YES - You are an admin'
    ELSE 'NO - You are not an admin'
  END as admin_status;
