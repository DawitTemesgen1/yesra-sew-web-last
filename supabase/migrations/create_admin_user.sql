-- ============================================
-- CREATE ADMIN USER
-- Run this to create a dedicated admin account
-- ============================================

-- Step 1: First, create the user in Supabase Auth Dashboard
-- Go to: Authentication > Users > Add User
-- Email: admin@yesrasew.com (or your preferred email)
-- Password: (set a strong password)
-- Auto Confirm User: YES

-- Step 2: After creating the user in Auth, run this to set admin role
-- REPLACE 'admin@yesrasew.com' with the email you used

UPDATE public.profiles
SET 
  role = 'super_admin',
  account_type = 'business',
  full_name = 'System Administrator'
WHERE email = 'admin@yesrasew.com';

-- Step 3: Verify the admin user was created
SELECT id, email, role, account_type, full_name, created_at
FROM public.profiles
WHERE role IN ('admin', 'super_admin');

-- ============================================
-- ALTERNATIVE: If you want to promote an existing user to admin
-- ============================================

-- Find your user by email
SELECT id, email, role, account_type
FROM public.profiles
WHERE email = 'your-email@example.com';

-- Promote to admin
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
