-- ============================================
-- FIX CATEGORY SLUGS
-- Ensure categories have the exact slugs the frontend expects
-- ============================================

-- 1. Update/Insert Categories with correct slugs
INSERT INTO public.categories (name, slug, icon, color, display_order)
VALUES 
  ('Cars', 'cars', 'DirectionsCar', '#1E88E5', 1),
  ('Homes', 'homes', 'Home', '#43A047', 2),
  ('Jobs', 'jobs', 'Work', '#E53935', 3),
  ('Tenders', 'tenders', 'Gavel', '#FB8C00', 4)
ON CONFLICT (slug) DO UPDATE 
SET 
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  display_order = EXCLUDED.display_order;

-- 2. Verify the IDs for these slugs
SELECT name, slug, id FROM public.categories;

-- 3. Update existing listings to point to these correct category IDs
-- This is crucial if listings were created with old/different category IDs
-- We'll try to map them based on some logic if possible, or just dump them all into 'Homes' for testing if needed.
-- For now, let's just see what we have.
