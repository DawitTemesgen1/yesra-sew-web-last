-- ============================================
-- ENSURE DEFAULT TEMPLATES EXIST
-- Run this to fix "No template found" errors
-- ============================================

DO $$
DECLARE
    v_cars_id UUID;
    v_homes_id UUID;
    v_jobs_id UUID;
    v_tenders_id UUID;
    v_template_id UUID;
    v_step_id UUID;
BEGIN
    -- 1. Get Category IDs (assuming they exist from ensure_categories.sql)
    SELECT id INTO v_cars_id FROM public.categories WHERE slug = 'cars';
    SELECT id INTO v_homes_id FROM public.categories WHERE slug = 'homes';
    SELECT id INTO v_jobs_id FROM public.categories WHERE slug = 'jobs';
    SELECT id INTO v_tenders_id FROM public.categories WHERE slug = 'tenders';

    -- ========================================================
    -- CARS TEMPLATE
    -- ========================================================
    IF v_cars_id IS NOT NULL THEN
        -- Create Template if not exists
        INSERT INTO public.post_templates (category_id, name, description, is_active)
        VALUES (v_cars_id, 'Car Sale Template', 'Standard template for selling cars', true)
        ON CONFLICT (category_id) DO NOTHING
        RETURNING id INTO v_template_id;

        -- If we just created it (or need to fetch existing)
        IF v_template_id IS NULL THEN
            SELECT id INTO v_template_id FROM public.post_templates WHERE category_id = v_cars_id;
        END IF;

        -- Create Step 1: Basic Info
        INSERT INTO public.template_steps (template_id, step_number, title, description, is_required)
        VALUES (v_template_id, 1, 'Vehicle Details', 'Basic information about the car', true)
        ON CONFLICT (template_id, step_number) DO NOTHING
        RETURNING id INTO v_step_id;

        IF v_step_id IS NULL THEN
            SELECT id INTO v_step_id FROM public.template_steps WHERE template_id = v_template_id AND step_number = 1;
        END IF;

        -- Add Fields to Step 1
        INSERT INTO public.template_fields (step_id, field_key, field_label, field_type, field_order, is_required, options)
        VALUES 
            (v_step_id, 'make', 'Make', 'select', 1, true, '["Toyota", "Honda", "Ford", "BMW", "Mercedes", "Hyundai", "Nissan"]'),
            (v_step_id, 'model', 'Model', 'text', 2, true, NULL),
            (v_step_id, 'year', 'Year', 'number', 3, true, NULL),
            (v_step_id, 'price', 'Price (ETB)', 'number', 4, true, NULL),
            (v_step_id, 'condition', 'Condition', 'select', 5, true, '["New", "Used", "Refurbished"]')
        ON CONFLICT (step_id, field_key) DO NOTHING;

        -- Create Step 2: Media
        INSERT INTO public.template_steps (template_id, step_number, title, description, is_required)
        VALUES (v_template_id, 2, 'Photos & Video', 'Upload images of your vehicle', true)
        ON CONFLICT (template_id, step_number) DO NOTHING
        RETURNING id INTO v_step_id;

        IF v_step_id IS NULL THEN
            SELECT id INTO v_step_id FROM public.template_steps WHERE template_id = v_template_id AND step_number = 2;
        END IF;

        -- Add Fields to Step 2
        INSERT INTO public.template_fields (step_id, field_key, field_label, field_type, field_order, is_required)
        VALUES 
            (v_step_id, 'images', 'Car Photos', 'image', 1, true),
            (v_step_id, 'video', 'Walkaround Video', 'video', 2, false)
        ON CONFLICT (step_id, field_key) DO NOTHING;
    END IF;

    -- ========================================================
    -- HOMES TEMPLATE
    -- ========================================================
    IF v_homes_id IS NOT NULL THEN
        INSERT INTO public.post_templates (category_id, name, description, is_active)
        VALUES (v_homes_id, 'Home Sale/Rent Template', 'Template for real estate', true)
        ON CONFLICT (category_id) DO NOTHING
        RETURNING id INTO v_template_id;

        IF v_template_id IS NULL THEN
            SELECT id INTO v_template_id FROM public.post_templates WHERE category_id = v_homes_id;
        END IF;

        -- Step 1
        INSERT INTO public.template_steps (template_id, step_number, title, description, is_required)
        VALUES (v_template_id, 1, 'Property Info', 'Details about the property', true)
        ON CONFLICT (template_id, step_number) DO NOTHING
        RETURNING id INTO v_step_id;

        IF v_step_id IS NULL THEN
            SELECT id INTO v_step_id FROM public.template_steps WHERE template_id = v_template_id AND step_number = 1;
        END IF;

        INSERT INTO public.template_fields (step_id, field_key, field_label, field_type, field_order, is_required, options)
        VALUES 
            (v_step_id, 'type', 'Property Type', 'select', 1, true, '["Apartment", "House", "Villa", "Condominium", "Land"]'),
            (v_step_id, 'bedrooms', 'Bedrooms', 'number', 2, true, NULL),
            (v_step_id, 'bathrooms', 'Bathrooms', 'number', 3, true, NULL),
            (v_step_id, 'area', 'Area (sqm)', 'number', 4, true, NULL),
            (v_step_id, 'price', 'Price', 'number', 5, true, NULL),
            (v_step_id, 'location', 'Location', 'text', 6, true, NULL)
        ON CONFLICT (step_id, field_key) DO NOTHING;

        -- Step 2: Media
        INSERT INTO public.template_steps (template_id, step_number, title, description, is_required)
        VALUES (v_template_id, 2, 'Images', 'Upload property photos', true)
        ON CONFLICT (template_id, step_number) DO NOTHING
        RETURNING id INTO v_step_id;

        IF v_step_id IS NULL THEN
            SELECT id INTO v_step_id FROM public.template_steps WHERE template_id = v_template_id AND step_number = 2;
        END IF;

        INSERT INTO public.template_fields (step_id, field_key, field_label, field_type, field_order, is_required)
        VALUES 
            (v_step_id, 'images', 'Property Photos', 'image', 1, true)
        ON CONFLICT (step_id, field_key) DO NOTHING;
    END IF;

    -- ========================================================
    -- JOBS TEMPLATE
    -- ========================================================
    IF v_jobs_id IS NOT NULL THEN
        INSERT INTO public.post_templates (category_id, name, description, is_active)
        VALUES (v_jobs_id, 'Job Posting Template', 'Template for job vacancies', true)
        ON CONFLICT (category_id) DO NOTHING
        RETURNING id INTO v_template_id;

        IF v_template_id IS NULL THEN
            SELECT id INTO v_template_id FROM public.post_templates WHERE category_id = v_jobs_id;
        END IF;

        -- Step 1
        INSERT INTO public.template_steps (template_id, step_number, title, description, is_required)
        VALUES (v_template_id, 1, 'Job Details', 'Information about the role', true)
        ON CONFLICT (template_id, step_number) DO NOTHING
        RETURNING id INTO v_step_id;

        IF v_step_id IS NULL THEN
            SELECT id INTO v_step_id FROM public.template_steps WHERE template_id = v_template_id AND step_number = 1;
        END IF;

        INSERT INTO public.template_fields (step_id, field_key, field_label, field_type, field_order, is_required, options)
        VALUES 
            (v_step_id, 'title', 'Job Title', 'text', 1, true, NULL),
            (v_step_id, 'company', 'Company Name', 'text', 2, true, NULL),
            (v_step_id, 'type', 'Employment Type', 'select', 3, true, '["Full-time", "Part-time", "Contract", "Remote"]'),
            (v_step_id, 'salary', 'Salary Range', 'text', 4, false, NULL),
            (v_step_id, 'description', 'Job Description', 'textarea', 5, true, NULL)
        ON CONFLICT (step_id, field_key) DO NOTHING;
    END IF;

    -- ========================================================
    -- TENDERS TEMPLATE
    -- ========================================================
    IF v_tenders_id IS NOT NULL THEN
        INSERT INTO public.post_templates (category_id, name, description, is_active)
        VALUES (v_tenders_id, 'Tender Notice Template', 'Template for tenders', true)
        ON CONFLICT (category_id) DO NOTHING
        RETURNING id INTO v_template_id;

        IF v_template_id IS NULL THEN
            SELECT id INTO v_template_id FROM public.post_templates WHERE category_id = v_tenders_id;
        END IF;

        -- Step 1
        INSERT INTO public.template_steps (template_id, step_number, title, description, is_required)
        VALUES (v_template_id, 1, 'Tender Info', 'Details about the tender', true)
        ON CONFLICT (template_id, step_number) DO NOTHING
        RETURNING id INTO v_step_id;

        IF v_step_id IS NULL THEN
            SELECT id INTO v_step_id FROM public.template_steps WHERE template_id = v_template_id AND step_number = 1;
        END IF;

        INSERT INTO public.template_fields (step_id, field_key, field_label, field_type, field_order, is_required)
        VALUES 
            (v_step_id, 'title', 'Tender Title', 'text', 1, true),
            (v_step_id, 'organization', 'Organization', 'text', 2, true),
            (v_step_id, 'deadline', 'Deadline', 'date', 3, true),
            (v_step_id, 'description', 'Description', 'textarea', 4, true)
        ON CONFLICT (step_id, field_key) DO NOTHING;
    END IF;

END $$;
