-- Add missing columns to membership_plans table
-- This migration adds duration_unit and duration_value columns
-- while keeping the existing 'duration' column for backward compatibility

-- Add duration_unit column (e.g., 'days', 'months', 'years')
ALTER TABLE public.membership_plans 
ADD COLUMN IF NOT EXISTS duration_unit TEXT DEFAULT 'months';

-- Add duration_value column (e.g., 1, 3, 12)
ALTER TABLE public.membership_plans 
ADD COLUMN IF NOT EXISTS duration_value INTEGER DEFAULT 1;

-- Add currency column if not exists
ALTER TABLE public.membership_plans 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'ETB';

-- Add badge_text column for custom badge text
ALTER TABLE public.membership_plans 
ADD COLUMN IF NOT EXISTS badge_text TEXT;

-- Update existing records to have proper duration_unit and duration_value
-- Based on the 'duration' column
UPDATE public.membership_plans 
SET 
    duration_unit = CASE 
        WHEN duration = 'monthly' THEN 'months'
        WHEN duration = 'quarterly' THEN 'months'
        WHEN duration = 'yearly' THEN 'years'
        WHEN duration = 'lifetime' THEN 'years'
        ELSE 'months'
    END,
    duration_value = CASE 
        WHEN duration = 'monthly' THEN 1
        WHEN duration = 'quarterly' THEN 3
        WHEN duration = 'yearly' THEN 1
        WHEN duration = 'lifetime' THEN 99
        ELSE 1
    END
WHERE duration_unit IS NULL OR duration_value IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.membership_plans.duration_unit IS 'Unit of time for subscription duration (days, months, years)';
COMMENT ON COLUMN public.membership_plans.duration_value IS 'Number of duration units (e.g., 1 month, 3 months, 12 months)';
COMMENT ON COLUMN public.membership_plans.currency IS 'Currency code (ETB, USD, etc.)';

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';
