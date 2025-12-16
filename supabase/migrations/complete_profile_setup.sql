-- Run this SQL in your Supabase SQL Editor

-- 1. Add full_name column if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 2. Add other missing columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}'::jsonb;

-- 3. Add indexes
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles(full_name);
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url ON public.profiles(avatar_url);

-- 4. Update existing profiles to have full_name from email if null
UPDATE public.profiles 
SET full_name = COALESCE(full_name, split_part(email, '@', 1))
WHERE full_name IS NULL;
