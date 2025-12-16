-- COMPREHENSIVE FIX: Listings, Settings, and Pages Permissions

-- 1. FIX LISTINGS: Allow Admins to View/Edit All Listings (Fixing "text = uuid" error)
DROP POLICY IF EXISTS "Admins can view all listings" ON listings;
DROP POLICY IF EXISTS "Admins can update all listings" ON listings;
DROP POLICY IF EXISTS "Admins can delete all listings" ON listings;

CREATE POLICY "Admins can view all listings"
ON listings FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id::text = auth.uid()::text AND role = 'admin')
  OR user_id::text = auth.uid()::text
  OR status IN ('active', 'approved')
);

CREATE POLICY "Admins can update all listings"
ON listings FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id::text = auth.uid()::text AND role = 'admin')
  OR user_id::text = auth.uid()::text
);

CREATE POLICY "Admins can delete all listings"
ON listings FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id::text = auth.uid()::text AND role = 'admin')
  OR user_id::text = auth.uid()::text
);

-- 2. FIX SYSTEM SETTINGS: Public Read, Admin Write (For Footer & Social Links)
-- Create table if not exists
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public read settings" ON system_settings;
DROP POLICY IF EXISTS "Admins manage settings" ON system_settings;

-- Public can read settings (needed for Footer)
CREATE POLICY "Public read settings"
ON system_settings FOR SELECT
TO public
USING (true);

-- Admins can manage settings
CREATE POLICY "Admins manage settings"
ON system_settings FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id::text = auth.uid()::text AND role = 'admin')
);

-- 3. FIX PAGES: Public Read, Admin Write (For Privacy/Terms content)
-- Create table if not exists
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content JSONB,
  sections JSONB, 
  meta_description TEXT,
  meta_keywords TEXT[],
  is_published BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  show_in_menu BOOLEAN DEFAULT false,
  menu_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public view published pages" ON pages;
DROP POLICY IF EXISTS "Admins manage pages" ON pages;

-- Public can view published pages
CREATE POLICY "Public view published pages"
ON pages FOR SELECT
TO public
USING (is_published = true);

-- Admins can manage all pages
CREATE POLICY "Admins manage pages"
ON pages FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id::text = auth.uid()::text AND role = 'admin')
);
