-- ============================================
-- VERIFY ADMIN ACCESS
-- Run this to check if you're properly set as admin
-- ============================================

-- 1. Check your current user ID
SELECT auth.uid() as my_user_id;

-- 2. Check your profile and role
SELECT id, email, role, account_type, created_at
FROM public.profiles
WHERE id = auth.uid();

-- 3. If you don't have admin role, set it now:
-- REPLACE 'your-email@example.com' with your actual email
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';

-- 4. Verify the update worked
SELECT id, email, role, account_type
FROM public.profiles
WHERE id = auth.uid();

-- 5. Test if you can now update a listing
-- REPLACE 'listing-uuid-here' with an actual listing ID
-- UPDATE public.listings
-- SET status = 'active'
-- WHERE id = 'listing-uuid-here';
