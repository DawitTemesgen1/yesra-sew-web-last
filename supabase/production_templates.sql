-- ============================================================================
-- PRODUCTION POST TEMPLATES SEED (Fixed: Multi-Step & Card Layout)
-- ============================================================================
-- Description: Creates standardized post templates with:
--              1. Multi-step wizard flow (Logical grouping)
--              2. Explicit Card Layout configuration (display_in_card, card_priority)
--              3. Professional field layouts (Main/Sidebar/Header)
-- Usage:       Run in Supabase Query Editor.
-- ============================================================================

DO $$
DECLARE
    -- Category IDs
    v_cars_id UUID;
    v_homes_id UUID;
    v_jobs_id UUID;
    v_tenders_id UUID;
    
    -- IDs
    v_tmpl_id UUID;
    v_step_id UUID;
BEGIN
    -- 1. Resolve Category IDs
    SELECT id INTO v_cars_id FROM categories WHERE slug = 'cars';
    SELECT id INTO v_homes_id FROM categories WHERE slug = 'homes';
    SELECT id INTO v_jobs_id FROM categories WHERE slug = 'jobs';
    SELECT id INTO v_tenders_id FROM categories WHERE slug = 'tenders';

    -- Raise notice for missing categories
    IF v_cars_id IS NULL THEN RAISE NOTICE 'Warning: Cars category not found'; END IF;
    IF v_homes_id IS NULL THEN RAISE NOTICE 'Warning: Homes category not found'; END IF;
    IF v_jobs_id IS NULL THEN RAISE NOTICE 'Warning: Jobs category not found'; END IF;
    IF v_tenders_id IS NULL THEN RAISE NOTICE 'Warning: Tenders category not found'; END IF;

    ---------------------------------------------------------------------------
    -- 1. CARS TEMPLATE (2 Steps)
    ---------------------------------------------------------------------------
    IF v_cars_id IS NOT NULL THEN
        -- Upsert Template
        INSERT INTO post_templates (category_id, name, is_active, updated_at)
        VALUES (v_cars_id, 'Vehicle Sale Professional', true, NOW())
        ON CONFLICT (category_id) DO UPDATE SET name = 'Vehicle Sale Professional', is_active = true, updated_at = NOW()
        RETURNING id INTO v_tmpl_id;

        DELETE FROM template_steps WHERE template_id = v_tmpl_id;

        -- Step 1: Core Details
        INSERT INTO template_steps (template_id, step_number, title, description)
        VALUES (v_tmpl_id, 1, 'Vehicle Identity', 'Make, Model, and Basic Info')
        RETURNING id INTO v_step_id;

        INSERT INTO template_fields (step_id, field_name, field_label, field_type, is_required, display_order, options, section, width, display_in_card, card_priority) VALUES
        (v_step_id, 'condition', 'Condition', 'select', true, 10, '["New", "Used", "Foreign Used"]', 'header', 'half', false, 0),
        (v_step_id, 'make', 'Make', 'select', true, 20, '["Toyota", "Hyundai", "Nissan", "Ford", "Honda", "Mercedes", "BMW", "Volkswagen", "Suzuki", "Isuzu", "Mitsubishi"]', 'header', 'half', true, 1),
        (v_step_id, 'model', 'Model', 'text', true, 30, NULL, 'main', 'half', true, 2),
        (v_step_id, 'year', 'Year', 'number', true, 40, NULL, 'main', 'half', true, 3);

        -- Step 2: Technical Specs
        INSERT INTO template_steps (template_id, step_number, title, description)
        VALUES (v_tmpl_id, 2, 'Technical Specifications', 'Engine, Transmission, and Features')
        RETURNING id INTO v_step_id;

        INSERT INTO template_fields (step_id, field_name, field_label, field_type, is_required, display_order, options, section, width, display_in_card, card_priority) VALUES
        (v_step_id, 'transmission', 'Transmission', 'select', true, 10, '["Automatic", "Manual", "Tiptronic", "CVT"]', 'main', 'half', true, 4),
        (v_step_id, 'fuel_type', 'Fuel Type', 'select', true, 20, '["Petrol", "Diesel", "Hybrid", "Electric"]', 'main', 'half', true, 5),
        (v_step_id, 'mileage', 'Mileage (km)', 'number', true, 30, NULL, 'main', 'full', true, 6),
        (v_step_id, 'color', 'Exterior Color', 'text', false, 40, NULL, 'sidebar', 'full', false, 0),
        (v_step_id, 'body_type', 'Body Type', 'select', false, 50, '["Sedan", "SUV", "Truck", "Van", "Coupe", "Hatchback", "Convertible", "Bus"]', 'sidebar', 'full', false, 0);
    END IF;

    ---------------------------------------------------------------------------
    -- 2. HOMES TEMPLATE (2 Steps)
    ---------------------------------------------------------------------------
    IF v_homes_id IS NOT NULL THEN
        INSERT INTO post_templates (category_id, name, is_active, updated_at)
        VALUES (v_homes_id, 'Real Estate Professional', true, NOW())
        ON CONFLICT (category_id) DO UPDATE SET name = 'Real Estate Professional', is_active = true, updated_at = NOW()
        RETURNING id INTO v_tmpl_id;

        DELETE FROM template_steps WHERE template_id = v_tmpl_id;

        -- Step 1: Overview
        INSERT INTO template_steps (template_id, step_number, title, description)
        VALUES (v_tmpl_id, 1, 'Property Overview', 'Type, Purpose, and Location')
        RETURNING id INTO v_step_id;

        INSERT INTO template_fields (step_id, field_name, field_label, field_type, is_required, display_order, options, section, width, display_in_card, card_priority) VALUES
        (v_step_id, 'listing_purpose', 'Purpose', 'select', true, 10, '["For Sale", "For Rent"]', 'header', 'half', true, 1),
        (v_step_id, 'property_type', 'Property Type', 'select', true, 20, '["Apartment", "House", "Villa", "Condominium", "Land", "Commercial", "Office"]', 'header', 'half', false, 0);
        
        -- Step 2: Features
        INSERT INTO template_steps (template_id, step_number, title, description)
        VALUES (v_tmpl_id, 2, 'Property Features', 'Rooms, Area, and Amenities')
        RETURNING id INTO v_step_id;

        INSERT INTO template_fields (step_id, field_name, field_label, field_type, is_required, display_order, options, section, width, display_in_card, card_priority) VALUES
        (v_step_id, 'bedrooms', 'Bedrooms', 'number', true, 10, NULL, 'main', 'half', true, 2),
        (v_step_id, 'bathrooms', 'Bathrooms', 'number', true, 20, NULL, 'main', 'half', true, 3),
        (v_step_id, 'area', 'Area (sqm)', 'number', true, 30, NULL, 'main', 'half', true, 4),
        (v_step_id, 'furnished', 'Furnishing', 'select', true, 40, '["Unfurnished", "Partially Furnished", "Fully Furnished"]', 'main', 'half', false, 0),
        (v_step_id, 'floor_level', 'Floor Level', 'number', false, 50, NULL, 'sidebar', 'full', false, 0),
        (v_step_id, 'parking_spaces', 'Parking Spaces', 'number', false, 60, NULL, 'sidebar', 'full', false, 0);
    END IF;

    ---------------------------------------------------------------------------
    -- 3. JOBS TEMPLATE (2 Steps)
    ---------------------------------------------------------------------------
    IF v_jobs_id IS NOT NULL THEN
        INSERT INTO post_templates (category_id, name, is_active, updated_at)
        VALUES (v_jobs_id, 'Job Vacancy Professional', true, NOW())
        ON CONFLICT (category_id) DO UPDATE SET name = 'Job Vacancy Professional', is_active = true, updated_at = NOW()
        RETURNING id INTO v_tmpl_id;

        DELETE FROM template_steps WHERE template_id = v_tmpl_id;

        -- Step 1: Role Overview
        INSERT INTO template_steps (template_id, step_number, title, description)
        VALUES (v_tmpl_id, 1, 'Role Overview', 'Position type and Sector')
        RETURNING id INTO v_step_id;

        INSERT INTO template_fields (step_id, field_name, field_label, field_type, is_required, display_order, options, section, width, display_in_card, card_priority) VALUES
        (v_step_id, 'employment_type', 'Employment Type', 'select', true, 10, '["Full-time", "Part-time", "Contract", "Internship", "Remote"]', 'header', 'half', true, 1),
        (v_step_id, 'experience_level', 'Experience Level', 'select', true, 20, '["Entry Level", "Junior", "Mid Level", "Senior Level", "Executive"]', 'header', 'half', true, 3),
        (v_step_id, 'sector', 'Sector', 'select', true, 30, '["Technology", "Finance", "Healthcare", "Education", "Engineering", "Sales", "Management"]', 'main', 'full', false, 0);

        -- Step 2: Details
        INSERT INTO template_steps (template_id, step_number, title, description)
        VALUES (v_tmpl_id, 2, 'Job Details', 'Deadline and Compensation')
        RETURNING id INTO v_step_id;

        INSERT INTO template_fields (step_id, field_name, field_label, field_type, is_required, display_order, options, section, width, display_in_card, card_priority) VALUES
        (v_step_id, 'deadline', 'Application Deadline', 'date', true, 10, NULL, 'main', 'half', true, 2),
        (v_step_id, 'vacancies', 'No. of Vacancies', 'number', false, 20, NULL, 'main', 'half', false, 0),
        (v_step_id, 'salary_min', 'Min Salary', 'number', false, 30, NULL, 'sidebar', 'full', true, 4),
        (v_step_id, 'salary_max', 'Max Salary', 'number', false, 40, NULL, 'sidebar', 'full', false, 0);
    END IF;

    ---------------------------------------------------------------------------
    -- 4. TENDERS TEMPLATE (2 Steps)
    ---------------------------------------------------------------------------
    IF v_tenders_id IS NOT NULL THEN
        INSERT INTO post_templates (category_id, name, is_active, updated_at)
        VALUES (v_tenders_id, 'Tender Notice Professional', true, NOW())
        ON CONFLICT (category_id) DO UPDATE SET name = 'Tender Notice Professional', is_active = true, updated_at = NOW()
        RETURNING id INTO v_tmpl_id;

        DELETE FROM template_steps WHERE template_id = v_tmpl_id;

        -- Step 1: Tender Info
        INSERT INTO template_steps (template_id, step_number, title, description)
        VALUES (v_tmpl_id, 1, 'Tender Info', 'Type and Deadlines')
        RETURNING id INTO v_step_id;

        INSERT INTO template_fields (step_id, field_name, field_label, field_type, is_required, display_order, options, section, width, display_in_card, card_priority) VALUES
        (v_step_id, 'tender_type', 'Tender Type', 'select', true, 10, '["Public", "Private", "International", "RFQ", "EOI"]', 'header', 'half', true, 1),
        (v_step_id, 'deadline', 'Closing Date', 'date', true, 20, NULL, 'header', 'half', true, 2),
        (v_step_id, 'sector', 'Sector', 'select', true, 30, '["Construction", "Supply", "Consultancy", "Service", "IT", "Transport"]', 'main', 'full', true, 3);
        
        -- Step 2: Requirements
        INSERT INTO template_steps (template_id, step_number, title, description)
        VALUES (v_tmpl_id, 2, 'Requirements', 'Security and Fees')
        RETURNING id INTO v_step_id;

        INSERT INTO template_fields (step_id, field_name, field_label, field_type, is_required, display_order, options, section, width, display_in_card, card_priority) VALUES
        (v_step_id, 'bid_security', 'Bid Security', 'text', false, 10, NULL, 'main', 'half', true, 4),
        (v_step_id, 'document_fee', 'Document Fee', 'number', false, 20, NULL, 'main', 'half', false, 0),
        (v_step_id, 'organization', 'Organization', 'text', true, 30, NULL, 'sidebar', 'full', false, 0);
    END IF;

    RAISE NOTICE 'Seed completed with Multi-step and Card Layout support.';
END $$;
