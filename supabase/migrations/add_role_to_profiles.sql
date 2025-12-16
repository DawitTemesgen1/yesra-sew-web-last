ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('super_admin', 'admin', 'moderator', 'premium_user', 'user'));
