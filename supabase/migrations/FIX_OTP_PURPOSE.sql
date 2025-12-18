-- ============================================
-- FIX: OTP Purpose Constraint
-- The Admin Text Email feature uses 'test_config' purpose, which was not allowed.
-- This script removes the restrictive check.
-- ============================================

DO $$
BEGIN
    -- Drop the constraint if it exists (Checking standard name)
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'otps_purpose_check'
        AND table_name = 'otps'
    ) THEN
        ALTER TABLE public.otps DROP CONSTRAINT otps_purpose_check;
    END IF;

    -- Also check for common variants just in case
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'otps_purpose_check1'
        AND table_name = 'otps'
    ) THEN
        ALTER TABLE public.otps DROP CONSTRAINT otps_purpose_check1;
    END IF;
END $$;
