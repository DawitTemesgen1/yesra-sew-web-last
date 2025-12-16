-- ============================================
-- ENSURE POST TEMPLATES EXIST FOR ALL CATEGORIES
-- (Corrected Schema: title instead of step_name, step_number instead of step_order)
-- ============================================

-- 1. Get Category IDs
DO $$
DECLARE
    cars_id UUID;
    homes_id UUID;
    jobs_id UUID;
    tenders_id UUID;
    template_id UUID;
BEGIN
    SELECT id INTO cars_id FROM public.categories WHERE slug = 'cars';
    SELECT id INTO homes_id FROM public.categories WHERE slug = 'homes';
    SELECT id INTO jobs_id FROM public.categories WHERE slug = 'jobs';
    SELECT id INTO tenders_id FROM public.categories WHERE slug = 'tenders';

    -- 2. Create Template for CARS if not exists
    IF cars_id IS NOT NULL THEN
        INSERT INTO public.post_templates (category_id, name, description, is_active)
        VALUES (cars_id, 'Car Listing Template', 'Standard template for selling or renting cars', true)
        ON CONFLICT (category_id) DO NOTHING
        RETURNING id INTO template_id;

        -- If template was created or already exists, ensure steps exist
        SELECT id INTO template_id FROM public.post_templates WHERE category_id = cars_id;
        
        -- Step 1: Basic Info
        INSERT INTO public.template_steps (template_id, title, step_number, description)
        VALUES (template_id, 'Vehicle Details', 1, 'Basic information about the vehicle')
        ON CONFLICT DO NOTHING;
        
        -- Step 2: Features & Media
        INSERT INTO public.template_steps (template_id, title, step_number, description)
        VALUES (template_id, 'Features & Media', 2, 'Upload photos and list features')
        ON CONFLICT DO NOTHING;
    END IF;

    -- 3. Create Template for HOMES if not exists
    IF homes_id IS NOT NULL THEN
        INSERT INTO public.post_templates (category_id, name, description, is_active)
        VALUES (homes_id, 'Home Listing Template', 'Standard template for selling or renting homes', true)
        ON CONFLICT (category_id) DO NOTHING
        RETURNING id INTO template_id;

        SELECT id INTO template_id FROM public.post_templates WHERE category_id = homes_id;

        INSERT INTO public.template_steps (template_id, title, step_number, description)
        VALUES (template_id, 'Property Details', 1, 'Basic information about the property')
        ON CONFLICT DO NOTHING;

        INSERT INTO public.template_steps (template_id, title, step_number, description)
        VALUES (template_id, 'Amenities & Photos', 2, 'List amenities and upload photos')
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4. Create Template for JOBS if not exists
    IF jobs_id IS NOT NULL THEN
        INSERT INTO public.post_templates (category_id, name, description, is_active)
        VALUES (jobs_id, 'Job Posting Template', 'Standard template for posting jobs', true)
        ON CONFLICT (category_id) DO NOTHING
        RETURNING id INTO template_id;

        SELECT id INTO template_id FROM public.post_templates WHERE category_id = jobs_id;

        INSERT INTO public.template_steps (template_id, title, step_number, description)
        VALUES (template_id, 'Job Details', 1, 'Role, company, and requirements')
        ON CONFLICT DO NOTHING;
    END IF;

    -- 5. Create Template for TENDERS if not exists
    IF tenders_id IS NOT NULL THEN
        INSERT INTO public.post_templates (category_id, name, description, is_active)
        VALUES (tenders_id, 'Tender Posting Template', 'Standard template for tenders', true)
        ON CONFLICT (category_id) DO NOTHING
        RETURNING id INTO template_id;

        SELECT id INTO template_id FROM public.post_templates WHERE category_id = tenders_id;

        INSERT INTO public.template_steps (template_id, title, step_number, description)
        VALUES (template_id, 'Tender Information', 1, 'Scope, budget, and deadline')
        ON CONFLICT DO NOTHING;
    END IF;

END $$;

-- 3. Verify Templates Created
SELECT 
    c.name as category,
    t.name as template_name,
    count(s.id) as step_count
FROM public.post_templates t
JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.template_steps s ON t.id = s.template_id
GROUP BY c.name, t.name;
