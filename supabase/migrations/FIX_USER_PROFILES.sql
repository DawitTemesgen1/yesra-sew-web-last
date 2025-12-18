-- ==========================================
-- FIX USER PROFILES & NAMES (V3 - Fixes Check Constraint)
-- ==========================================

-- 1. IMPROVE THE AUTO-CREATE TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  meta_full_name TEXT;
  meta_first_name TEXT;
  meta_last_name TEXT;
  
  final_full_name TEXT;
  final_first_name TEXT;
  final_last_name TEXT;
BEGIN
  -- Extract from metadata
  meta_full_name := NEW.raw_user_meta_data->>'full_name';
  meta_first_name := NEW.raw_user_meta_data->>'first_name';
  meta_last_name := NEW.raw_user_meta_data->>'last_name';

  -- 1. Determine First Name
  IF meta_first_name IS NOT NULL AND meta_first_name != '' THEN
    final_first_name := meta_first_name;
  ELSIF meta_full_name IS NOT NULL AND meta_full_name != '' THEN
    final_first_name := split_part(meta_full_name, ' ', 1);
  ELSE
    final_first_name := 'User';
  END IF;

  -- 2. Determine Last Name
  IF meta_last_name IS NOT NULL THEN
    final_last_name := meta_last_name;
  ELSIF meta_full_name IS NOT NULL AND meta_full_name != '' THEN
    final_last_name := TRIM(SUBSTR(meta_full_name, LENGTH(final_first_name) + 1));
  ELSE
    final_last_name := '';
  END IF;

  -- 3. Determine Full Name
  IF meta_full_name IS NOT NULL AND meta_full_name != '' THEN
    final_full_name := meta_full_name;
  ELSE
    final_full_name := TRIM(final_first_name || ' ' || final_last_name);
  END IF;

  -- Insert (Now includes PHONE to satisfy profiles_email_or_phone_check)
  INSERT INTO public.profiles (id, email, phone, full_name, first_name, last_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone, -- Critical for phone-only users
    final_full_name,
    final_first_name,
    final_last_name,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    full_name = EXCLUDED.full_name,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. BACKFILL EXISTING USERS
-- Safe update that respects existing data if present
UPDATE public.profiles p
SET 
  first_name = COALESCE(
    p.first_name, 
    u.raw_user_meta_data->>'first_name',
    split_part(u.raw_user_meta_data->>'full_name', ' ', 1),
    'User'
  ),
  last_name = COALESCE(
    p.last_name,
    u.raw_user_meta_data->>'last_name',
    TRIM(SUBSTR(COALESCE(u.raw_user_meta_data->>'full_name', ''), LENGTH(split_part(COALESCE(u.raw_user_meta_data->>'full_name', ''), ' ', 1)) + 1)),
    ''
  ),
  full_name = COALESCE(
    p.full_name,
    u.raw_user_meta_data->>'full_name',
    (COALESCE(u.raw_user_meta_data->>'first_name', 'User') || ' ' || COALESCE(u.raw_user_meta_data->>'last_name', ''))
  )
FROM auth.users u
WHERE p.id = u.id
AND (p.first_name IS NULL OR p.full_name IS NULL OR p.full_name = p.email);

-- 3. INSERT MISSING PROFILES
INSERT INTO public.profiles (id, email, phone, full_name, first_name, last_name)
SELECT 
  u.id, 
  u.email,
  u.phone, -- Added phone here too
  -- Full Name
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    (COALESCE(u.raw_user_meta_data->>'first_name', 'User') || ' ' || COALESCE(u.raw_user_meta_data->>'last_name', '')),
    u.email
  ),
  -- First Name
  COALESCE(
    u.raw_user_meta_data->>'first_name', 
    split_part(u.raw_user_meta_data->>'full_name', ' ', 1),
    'User'
  ),
  -- Last Name
  COALESCE(
    u.raw_user_meta_data->>'last_name',
    TRIM(SUBSTR(COALESCE(u.raw_user_meta_data->>'full_name', ''), LENGTH(split_part(COALESCE(u.raw_user_meta_data->>'full_name', ''), ' ', 1)) + 1)),
    ''
  )
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);
