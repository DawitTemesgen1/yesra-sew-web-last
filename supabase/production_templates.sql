-- ============================================================================
-- PRODUCTION POST TEMPLATES SEED (Fixed for Unique Constraint)
-- ============================================================================
-- Description: Creates or Updates standardized post templates for the 4 core categories.
--              Handles existing templates by overwriting them with the professional structure.
--              Includes professional layouts (main/sidebar) matching the Admin Panel logic.
-- Usage:       Run in Supabase Query Editor.
-- ============================================================================

DO $$
DECLARE
    -- Category IDs (looked up dynamically from existing slugs)
    v_cars_id UUID;
    v_homes_id UUID;
    v_jobs_id UUID;
    v_tenders_id UUID;
    
    -- Variables for IDs
    v_tmpl_id UUID;
    v_step_id UUID;
BEGIN
    -- 1. Resolve Category IDs from Slugs
    SELECT id INTO v_cars_id FROM categories WHERE slug = 'cars';
    SELECT id INTO v_homes_id FROM categories WHERE slug = 'homes';
    SELECT id INTO v_jobs_id FROM categories WHERE slug = 'jobs';
    SELECT id INTO v_tenders_id FROM categories WHERE slug = 'tenders';

    -- Raise notice for missing categories
    IF v_cars_id IS NULL THEN RAISE NOTICE 'Warning: Cars category not found (slug=cars)'; END IF;
    IF v_homes_id IS NULL THEN RAISE NOTICE 'Warning: Homes category not found (slug=homes)'; END IF;
    IF v_jobs_id IS NULL THEN RAISE NOTICE 'Warning: Jobs category not found (slug=jobs)'; END IF;
    IF v_tenders_id IS NULL THEN RAISE NOTICE 'Warning: Tenders category not found (slug=tenders)'; END IF;

    ---------------------------------------------------------------------------
    -- 1. CARS TEMPLATE
    -- Layout: Tech specs in Main, Quick facts in Sidebar
    ---------------------------------------------------------------------------
    IF v_cars_id IS NOT NULL THEN
        -- Upsert Template (Update if exists, Insert if new)
        -- We handle the unique constraint on category_id
        INSERT INTO post_templates (category_id, name, is_active, updated_at)
        VALUES (v_cars_id, 'Vehicle Sale Professional', true, NOW())
        ON CONFLICT (category_id) 
        DO UPDATE SET name = 'Vehicle Sale Professional', is_active = true, updated_at = NOW()
        RETURNING id INTO v_tmpl_id;

        -- CLEAR OLD STEPS (To ensure clean professional structure)
        -- This removes existing steps/fields for this template before adding new ones
        DELETE FROM template_steps WHERE template_id = v_tmpl_id;

        -- Step 1: Vehicle Specifications
        INSERT INTO template_steps (template_id, step_number, title, description)
        VALUES (v_tmpl_id, 1, 'Vehicle Specifications', 'Enter the technical details of the vehicle')
        RETURNING id INTO v_step_id;

        -- Fields
        INSERT INTO template_fields (step_id, field_name, field_label, field_type, is_required, display_order, options, section, width) VALUES
        -- Header Section
        (v_step_id, 'condition', 'Condition', 'select', true, 10, '["New", "Used", "Foreign Used"]', 'header', 'half'),
        (v_step_id, 'make', 'Make', 'select', true, 20, '["Toyota", "Hyundai", "Nissan", "Ford", "Honda", "Mercedes", "BMW", "Volkswagen", "Suzuki", "Isuzu", "Mitsubishi"]', 'header', 'half'),
        
        -- Main Section
        (v_step_id, 'model', 'Model', 'text', true, 30, NULL, 'main', 'half'),
        (v_step_id, 'year', 'Year', 'number', true, 40, NULL, 'main', 'half'),
        (v_step_id, 'transmission', 'Transmission', 'select', true, 50, '["Automatic", "Manual", "Tiptronic", "CVT"]', 'main', 'half'),
        (v_step_id, 'fuel_type', 'Fuel Type', 'select', true, 60, '["Petrol", "Diesel", "Hybrid", "Electric"]', 'main', 'half'),
        (v_step_id, 'mileage', 'Mileage (km)', 'number', true, 70, NULL, 'main', 'full'),
        
        -- Sidebar Section
        (v_step_id, 'color', 'Exterior Color', 'text', false, 80, NULL, 'sidebar', 'full'),
        (v_step_id, 'body_type', 'Body Type', 'select', false, 90, '["Sedan", "SUV", "Truck", "Van", "Coupe", "Hatchback", "Convertible", "Bus"]', 'sidebar', 'full');
    END IF;

    ---------------------------------------------------------------------------
    -- 2. HOMES TEMPLATE
    -- Layout: Core Property listing
    ---------------------------------------------------------------------------
    IF v_homes_id IS NOT NULL THEN
        INSERT INTO post_templates (category_id, name, is_active, updated_at)
        VALUES (v_homes_id, 'Real Estate Professional', true, NOW())
        ON CONFLICT (category_id) 
        DO UPDATE SET name = 'Real Estate Professional', is_active = true, updated_at = NOW()
        RETURNING id INTO v_tmpl_id;

        DELETE FROM template_steps WHERE template_id = v_tmpl_id;

        INSERT INTO template_steps (template_id, step_number, title, description)
        VALUES (v_tmpl_id, 1, 'Property Characteristics', 'Key features of the property')
        RETURNING id INTO v_step_id;

        INSERT INTO template_fields (step_id, field_name, field_label, field_type, is_required, display_order, options, section, width) VALUES
        -- Header
        (v_step_id, 'listing_purpose', 'Purpose', 'select', true, 10, '["For Sale", "For Rent"]', 'header', 'half'),
        (v_step_id, 'property_type', 'Property Type', 'select', true, 20, '["Apartment", "House", "Villa", "Condominium", "Land", "Commercial", "Office", "Warehouse"]', 'header', 'half'),
        
        -- Main
        (v_step_id, 'bedrooms', 'Bedrooms', 'number', true, 30, NULL, 'main', 'half'),
        (v_step_id, 'bathrooms', 'Bathrooms', 'number', true, 40, NULL, 'main', 'half'),
        (v_step_id, 'area', 'Area (sqm)', 'number', true, 50, NULL, 'main', 'half'),
        (v_step_id, 'furnished', 'Furnishing', 'select', true, 60, '["Unfurnished", "Partially Furnished", "Fully Furnished"]', 'main', 'half'),
        
        -- Sidebar
        (v_step_id, 'floor_level', 'Floor Level', 'number', false, 70, NULL, 'sidebar', 'full'),
        (v_step_id, 'parking_spaces', 'Parking Spaces', 'number', false, 80, NULL, 'sidebar', 'full');
    END IF;

    ---------------------------------------------------------------------------
    -- 3. JOBS TEMPLATE
    -- Layout: Professional HR Standard
    ---------------------------------------------------------------------------
    IF v_jobs_id IS NOT NULL THEN
        INSERT INTO post_templates (category_id, name, is_active, updated_at)
        VALUES (v_jobs_id, 'Job Vacancy Professional', true, NOW())
        ON CONFLICT (category_id) 
        DO UPDATE SET name = 'Job Vacancy Professional', is_active = true, updated_at = NOW()
        RETURNING id INTO v_tmpl_id;

        DELETE FROM template_steps WHERE template_id = v_tmpl_id;

        INSERT INTO template_steps (template_id, step_number, title, description)
        VALUES (v_tmpl_id, 1, 'Job Details', 'Define the role and requirements')
        RETURNING id INTO v_step_id;

        INSERT INTO template_fields (step_id, field_name, field_label, field_type, is_required, display_order, options, section, width) VALUES
        -- Header
        (v_step_id, 'employment_type', 'Employment Type', 'select', true, 10, '["Full-time", "Part-time", "Contract", "Internship", "Remote", "Freelance"]', 'header', 'half'),
        (v_step_id, 'experience_level', 'Experience Level', 'select', true, 20, '["Entry Level", "Junior", "Mid Level", "Senior Level", "Executive"]', 'header', 'half'),
        
        -- Main
        (v_step_id, 'deadline', 'Application Deadline', 'date', true, 30, NULL, 'main', 'half'),
        (v_step_id, 'vacancies', 'No. of Vacancies', 'number', false, 40, NULL, 'main', 'half'),
        (v_step_id, 'sector', 'Industry Sector', 'select', true, 50, '["Technology", "Finance", "Healthcare", "Education", "Engineering", "Sales", "Management", "Construction", "Hospitality"]', 'main', 'full'),
        
        -- Sidebar
        (v_step_id, 'salary_min', 'Min Salary (Monthly)', 'number', false, 60, NULL, 'sidebar', 'full'),
        (v_step_id, 'salary_max', 'Max Salary (Monthly)', 'number', false, 70, NULL, 'sidebar', 'full');
    END IF;

    ---------------------------------------------------------------------------
    -- 4. TENDERS TEMPLATE
    -- Layout: Procurement Standard
    ---------------------------------------------------------------------------
    IF v_tenders_id IS NOT NULL THEN
        INSERT INTO post_templates (category_id, name, is_active, updated_at)
        VALUES (v_tenders_id, 'Tender Notice Professional', true, NOW())
        ON CONFLICT (category_id) 
        DO UPDATE SET name = 'Tender Notice Professional', is_active = true, updated_at = NOW()
        RETURNING id INTO v_tmpl_id;

        DELETE FROM template_steps WHERE template_id = v_tmpl_id;

        INSERT INTO template_steps (template_id, step_number, title, description)
        VALUES (v_tmpl_id, 1, 'Tender Details', 'Official tender documentation')
        RETURNING id INTO v_step_id;

        INSERT INTO template_fields (step_id, field_name, field_label, field_type, is_required, display_order, options, section, width) VALUES
        -- Header
        (v_step_id, 'tender_type', 'Tender Type', 'select', true, 10, '["Public", "Private", "International", "RFQ", "EOI"]', 'header', 'half'),
        (v_step_id, 'deadline', 'Closing Date & Time', 'date', true, 20, NULL, 'header', 'half'),
        
        -- Main
        (v_step_id, 'bid_security', 'Bid Security (CPO Amount)', 'text', false, 30, NULL, 'main', 'half'),
        (v_step_id, 'document_fee', 'Document Fee (ETB)', 'number', false, 40, NULL, 'main', 'half'),
        (v_step_id, 'sector', 'Sector', 'select', true, 50, '["Construction", "Supply", "Consultancy", "Service", "IT", "Transport"]', 'main', 'full'),
        
        -- Sidebar
        (v_step_id, 'organization', 'Organization Name', 'text', true, 60, NULL, 'sidebar', 'full'),
        (v_step_id, 'reference_no', 'Reference Number', 'text', false, 70, NULL, 'sidebar', 'full');
    END IF;

    RAISE NOTICE 'Seed completed successfully. Templates updated in place.';
END $$;
