-- ============================================
-- DIAGNOSTIC: Check what's blocking public listings
-- Run this to see exactly what's happening
-- ============================================

-- 1. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'listings';

-- 2. Check ALL policies on listings table
SELECT 
  policyname,
  cmd as command,
  roles,
  qual as using_condition,
  with_check
FROM pg_policies
WHERE tablename = 'listings'
ORDER BY policyname;

-- 3. Check actual listing data
SELECT 
  id,
  title,
  status,
  category_id,
  user_id,
  created_at,
  expires_at,
  CASE 
    WHEN expires_at IS NOT NULL AND expires_at < NOW() THEN 'EXPIRED'
    ELSE 'VALID'
  END as expiration_status
FROM public.listings
ORDER BY created_at DESC
LIMIT 10;

-- 4. Count listings by status
SELECT 
  status,
  COUNT(*) as count,
  COUNT(CASE WHEN expires_at IS NULL OR expires_at > NOW() THEN 1 END) as not_expired
FROM public.listings
GROUP BY status
ORDER BY status;

-- 5. Test if anonymous users can see listings
SET ROLE anon;
SELECT COUNT(*) as visible_to_public FROM public.listings;
RESET ROLE;

-- 6. Check categories exist
SELECT id, name, slug FROM public.categories ORDER BY name;

-- 7. Check if there are any additional filters in triggers
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'listings';
