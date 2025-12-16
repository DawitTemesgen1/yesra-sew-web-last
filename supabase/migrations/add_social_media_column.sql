-- Add social_media column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}'::jsonb;

-- Add telegram column if you prefer separate columns (optional, but JSONB is flexible)
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram TEXT;
