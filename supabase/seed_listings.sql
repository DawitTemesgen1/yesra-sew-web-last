-- ============================================================================
-- SEED LISTINGS (REALISTIC DATA)
-- ============================================================================
-- Description: Populates the 'listings' table with high-quality test data
--              using the keys defined in 'production_templates.sql'.
--              Includes Premium, Featured, and Standard listings.
-- Usage:       Run in Supabase Query Editor.
-- ============================================================================

DO $$
DECLARE
    -- IDs
    v_user_id UUID;
    v_cars_id UUID;
    v_homes_id UUID;
    v_jobs_id UUID;
    v_tenders_id UUID;
    
    -- Images (Placeholder URLs)
    v_img_car1 TEXT := 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80';
    v_img_car2 TEXT := 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80';
    v_img_home1 TEXT := 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80';
    v_img_home2 TEXT := 'https://images.unsplash.com/photo-1600596542815-e3289053dada?auto=format&fit=crop&w=800&q=80';
    v_img_job1 TEXT := 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80';
    v_img_tender1 TEXT := 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80';

BEGIN
    -- 1. Get Categories
    SELECT id INTO v_cars_id FROM categories WHERE slug = 'cars';
    SELECT id INTO v_homes_id FROM categories WHERE slug = 'homes';
    SELECT id INTO v_jobs_id FROM categories WHERE slug = 'jobs';
    SELECT id INTO v_tenders_id FROM categories WHERE slug = 'tenders';

    -- 2. Get a User (Pick the first valid profile to assign listings to)
    --    Ideally, use your own Admin ID if you know it. Here we pick one safe user.
    SELECT id INTO v_user_id FROM profiles LIMIT 1;

    -- Safety Check
    IF v_user_id IS NULL THEN 
        RAISE EXCEPTION 'No user profiles found. Please create a user first.'; 
    END IF;

    -- ========================================================================
    -- CARS (3 Listings)
    -- ========================================================================
    IF v_cars_id IS NOT NULL THEN
        -- Link to Template? The system maps by Category.
        
        -- Listing 1: Premium Toyota (Card Config: Year, Trans, Fuel, Mileage)
        INSERT INTO listings (
            user_id, category_id, title, description, price, currency, 
            status, is_active, is_premium, is_featured,
            images, location, custom_fields, created_at
        ) VALUES (
            v_user_id, v_cars_id, 
            'Toyota Land Cruiser 2023 - V8', 
            'Immaculate condition, full option V8 Land Cruiser using the new professional template fields. Barely driven.',
            18500000, 'ETB',
            'active', true, true, true, -- Premium & Featured
            ARRAY[v_img_car1]::text[],
            'Bole, Addis Ababa',
            '{
                "condition": "Used",
                "make": "Toyota",
                "model": "Land Cruiser V8",
                "year": 2023,
                "transmission": "Automatic",
                "fuel_type": "Diesel",
                "mileage": 12500,
                "color": "Pearl White",
                "body_type": "SUV"
            }'::jsonb,
            NOW()
        );

        -- Listing 2: Hyundai (Standard)
        INSERT INTO listings (
            user_id, category_id, title, description, price, currency,
            status, is_active, is_premium, is_featured,
            images, location, custom_fields, created_at
        ) VALUES (
            v_user_id, v_cars_id,
            'Hyundai Tucson 2021',
            'Great city car, fuel efficient, maintained at dealership.',
            4200000, 'ETB',
            'active', true, false, false,
            ARRAY[v_img_car2]::text[],
            'Kazanchis, Addis Ababa',
            '{
                "condition": "Used",
                "make": "Hyundai",
                "model": "Tucson",
                "year": 2021,
                "transmission": "Automatic",
                "fuel_type": "Petrol",
                "mileage": 45000,
                "color": "Silver",
                "body_type": "SUV"
            }'::jsonb,
            NOW() - INTERVAL '2 days'
        );
    END IF;

    -- ========================================================================
    -- HOMES (2 Listings)
    -- ========================================================================
    IF v_homes_id IS NOT NULL THEN
        -- Listing 1: Luxury Villa (Premium)
        INSERT INTO listings (
            user_id, category_id, title, description, price, currency,
            status, is_active, is_premium, is_featured,
            images, location, custom_fields, created_at
        ) VALUES (
            v_user_id, v_homes_id,
            'Modern G+2 Villa in Sarbet',
            'Luxury finishings, spacious garden, and quiet neighborhood.',
            45000000, 'ETB',
            'active', true, true, true,
            ARRAY[v_img_home1]::text[],
            'Sarbet, Addis Ababa',
            '{
                "listing_purpose": "For Sale",
                "property_type": "Villa",
                "bedrooms": 6,
                "bathrooms": 5,
                "area": 500,
                "furnished": "Partially Furnished",
                "parking_spaces": 4
            }'::jsonb,
            NOW() - INTERVAL '1 day'
        );

        -- Listing 2: Apartment (Standard)
        INSERT INTO listings (
            user_id, category_id, title, description, price, currency,
            status, is_active, is_premium, is_featured,
            images, location, custom_fields, created_at
        ) VALUES (
            v_user_id, v_homes_id,
            '2 Bedroom Apartment near Airport',
            'Convenient location, secured compound.',
            15000000, 'ETB',
            'active', true, false, false,
            ARRAY[v_img_home2]::text[],
            'Bole, Addis Ababa',
            '{
                "listing_purpose": "For Sale",
                "property_type": "Apartment",
                "bedrooms": 2,
                "bathrooms": 2,
                "area": 110,
                "furnished": "Unfurnished",
                "floor_level": 4
            }'::jsonb,
            NOW() - INTERVAL '5 days'
        );
    END IF;

    -- ========================================================================
    -- JOBS (1 Listing)
    -- ========================================================================
    IF v_jobs_id IS NOT NULL THEN
        INSERT INTO listings (
            user_id, category_id, title, description, price, currency,
            status, is_active, is_premium, is_featured,
            images, location, custom_fields, created_at
        ) VALUES (
            v_user_id, v_jobs_id,
            'Senior React Developer',
            'We are looking for an experienced developer to join our tech team. Remote work possible.',
            0, 'ETB', -- Jobs often have 0 price or salary range field
            'active', true, true, false,
            ARRAY[v_img_job1]::text[],
            'Remotely / Addis Ababa',
            '{
                "employment_type": "Full-time",
                "experience_level": "Senior Level",
                "deadline": "2024-12-31",
                "sector": "Technology",
                "vacancies": 2,
                "salary_min": 25000,
                "salary_max": 45000
            }'::jsonb,
            NOW()
        );
    END IF;

    -- ========================================================================
    -- TENDERS (1 Listing)
    -- ========================================================================
    IF v_tenders_id IS NOT NULL THEN
        INSERT INTO listings (
            user_id, category_id, title, description, price, currency,
            status, is_active, is_premium, is_featured,
            images, location, custom_fields, created_at
        ) VALUES (
            v_user_id, v_tenders_id,
            'Procurement of Office Furniture',
            'Open tender for the supply of office chairs and desks.',
            500, 'ETB', -- Document Fee usually
            'active', true, false, false,
            ARRAY[v_img_tender1]::text[],
            'Addis Ababa',
            '{
                "tender_type": "Public",
                "deadline": "2024-06-30",
                "sector": "Supply",
                "document_fee": 500,
                "organization": "Commercial Bank of Ethiopia"
            }'::jsonb,
            NOW() - INTERVAL '3 hours'
        );
    END IF;

    RAISE NOTICE 'Seed listings created successfully!';
END $$;
