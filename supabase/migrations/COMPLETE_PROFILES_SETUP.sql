-- ============================================
-- COMPLETE PROFILES TABLE SETUP
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- 1. Add all missing columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('super_admin', 'admin', 'moderator', 'premium_user', 'user'));

-- 2. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles(full_name);
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url ON public.profiles(avatar_url);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(location);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);

-- 3. Update existing profiles to have full_name from email if null
UPDATE public.profiles 
SET full_name = COALESCE(full_name, split_part(email, '@', 1))
WHERE full_name IS NULL AND email IS NOT NULL;

-- 4. For phone-registered users (no email), set full_name from phone if null
UPDATE public.profiles 
SET full_name = COALESCE(full_name, 'User ' || substring(phone from 1 for 4))
WHERE full_name IS NULL AND phone IS NOT NULL;

-- 5. Format phone numbers to show properly (remove +251 prefix for display if needed)
-- This keeps the data but you can add a computed column for display
-- Note: Keep the actual phone in international format in the database

-- 6. Ensure email is nullable for phone-only users
-- (It should already be nullable, but let's verify)
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

-- 7. Add a check to ensure either email OR phone exists
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_email_or_phone_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_or_phone_check 
CHECK (email IS NOT NULL OR phone IS NOT NULL);

-- 8. Create a function to get display name (full_name, email, or phone)
CREATE OR REPLACE FUNCTION public.get_profile_display_name(profile_row public.profiles)
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    profile_row.full_name,
    profile_row.email,
    profile_row.phone,
    'Unknown User'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 9. Create a function to format phone for display (removes +251 prefix)
CREATE OR REPLACE FUNCTION public.format_phone_display(phone_number TEXT)
RETURNS TEXT AS $$
BEGIN
  IF phone_number IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- If starts with +251, show as 09XXXXXXXX
  IF phone_number LIKE '+251%' THEN
    RETURN '0' || substring(phone_number from 5);
  END IF;
  
  -- If starts with 251, show as 09XXXXXXXX
  IF phone_number LIKE '251%' THEN
    RETURN '0' || substring(phone_number from 4);
  END IF;
  
  -- Otherwise return as is
  RETURN phone_number;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 10. Update RLS policies to allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- 11. Ensure profiles table has RLS enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STORAGE BUCKET SETUP FOR AVATARS
-- ============================================

-- 12. Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 13. Storage policies for avatars bucket
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- VERIFICATION & SUMMARY
-- ============================================

-- Show the updated profiles table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Show sample data to verify
SELECT 
  id,
  email,
  phone,
  full_name,
  location,
  bio,
  avatar_url,
  role,
  is_active,
  verified
FROM public.profiles
LIMIT 5;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- All columns added:
-- ✅ full_name
-- ✅ bio  
-- ✅ avatar_url
-- ✅ location
-- ✅ phone
-- ✅ social_media
-- ✅ verified
-- ✅ rating
-- ✅ reviews_count
-- ✅ is_active
-- ✅ role
--
-- Features added:
-- ✅ Email is now optional (for phone-only users)
-- ✅ Phone display formatting function
-- ✅ Display name helper function
-- ✅ Avatars storage bucket with policies
-- ✅ Proper RLS policies
-- ✅ Indexes for performance
-- ============================================
