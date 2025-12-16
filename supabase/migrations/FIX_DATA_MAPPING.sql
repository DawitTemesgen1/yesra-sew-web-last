-- ============================================
-- FIX DATA TYPE MISMATCH & LINK LISTINGS CORRECTLY
-- ============================================

-- 1. Ensure Categories Exist and Get their IDs
INSERT INTO public.categories (name, slug, icon, color, display_order)
VALUES 
  ('Cars', 'cars', 'DirectionsCar', '#1E88E5', 1),
  ('Homes', 'homes', 'Home', '#43A047', 2),
  ('Jobs', 'jobs', 'Work', '#E53935', 3),
  ('Tenders', 'tenders', 'Gavel', '#FB8C00', 4)
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name;

-- 2. Update Listings with Old IDs ("1", "2", "3", "4") to New UUIDs
-- We cast to UUID only AFTER updating the text values

DO $$
DECLARE
    cars_id UUID;
    homes_id UUID;
    jobs_id UUID;
    tenders_id UUID;
BEGIN
    -- Get the IDs
    SELECT id INTO cars_id FROM public.categories WHERE slug = 'cars';
    SELECT id INTO homes_id FROM public.categories WHERE slug = 'homes';
    SELECT id INTO jobs_id FROM public.categories WHERE slug = 'jobs';
    SELECT id INTO tenders_id FROM public.categories WHERE slug = 'tenders';

    -- Update Listings (assuming 1=Cars, 2=Homes, 3=Jobs, 4=Tenders based on typical order)
    -- Adjust the mapping if your old IDs meant something else
    
    -- Fix "1" -> Cars
    UPDATE public.listings 
    SET category_id = cars_id::text 
    WHERE category_id = '1' OR category_id = 'Cars';

    -- Fix "2" -> Homes
    UPDATE public.listings 
    SET category_id = homes_id::text 
    WHERE category_id = '2' OR category_id = 'Homes';

    -- Fix "3" -> Jobs
    UPDATE public.listings 
    SET category_id = jobs_id::text 
    WHERE category_id = '3' OR category_id = 'Jobs';

    -- Fix "4" -> Tenders
    UPDATE public.listings 
    SET category_id = tenders_id::text 
    WHERE category_id = '4' OR category_id = 'Tenders';

END $$;

-- 3. Now verify the join works (it should not error now)
SELECT 
    l.title, 
    c.name as category, 
    l.status 
FROM public.listings l 
JOIN public.categories c ON l.category_id::uuid = c.id
LIMIT 5;
