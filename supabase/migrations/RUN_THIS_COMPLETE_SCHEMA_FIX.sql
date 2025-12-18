-- COMPLETE SCHEMA FIX - Run all migrations in order
-- This file combines all necessary schema fixes
-- Run this ONCE in Supabase SQL Editor

-- ============================================================
-- PART 1: Add missing columns to membership_plans
-- ============================================================

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

-- ============================================================
-- PART 2: Add missing columns to user_subscriptions
-- ============================================================

-- Add listings_used column (tracks total posts made)
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS listings_used INTEGER DEFAULT 0;

-- Add category_usage column (tracks posts per category as JSONB)
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS category_usage JSONB DEFAULT '{}'::jsonb;

-- Add amount_paid column if missing
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10, 2) DEFAULT 0;

-- Add transaction_id column for payment reference
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS transaction_id TEXT;

-- Add notes column for admin notes
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Set default values for existing records
UPDATE public.user_subscriptions 
SET 
    listings_used = COALESCE(listings_used, 0),
    category_usage = COALESCE(category_usage, '{}'::jsonb),
    amount_paid = COALESCE(amount_paid, 0)
WHERE listings_used IS NULL 
   OR category_usage IS NULL 
   OR amount_paid IS NULL;

-- ============================================================
-- PART 3: Create activate_user_plan function
-- ============================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.activate_user_plan(UUID, UUID, INTEGER);

-- Create function to activate a plan for a user (bypasses RLS)
CREATE OR REPLACE FUNCTION public.activate_user_plan(
    p_user_id UUID,
    p_plan_id UUID,
    p_duration_days INTEGER DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_subscription_id UUID;
    v_plan_record RECORD;
    v_start_date TIMESTAMP WITH TIME ZONE;
    v_end_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Validate inputs
    IF p_user_id IS NULL OR p_plan_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User ID and Plan ID are required'
        );
    END IF;

    -- Get plan details
    SELECT * INTO v_plan_record
    FROM public.membership_plans
    WHERE id = p_plan_id AND is_active = true;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Plan not found or inactive'
        );
    END IF;

    -- Check if user already has an active subscription for this plan
    IF EXISTS (
        SELECT 1 FROM public.user_subscriptions
        WHERE user_id = p_user_id
        AND plan_id = p_plan_id
        AND status = 'active'
        AND end_date > NOW()
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User already has an active subscription for this plan',
            'already_active', true
        );
    END IF;

    -- Calculate dates
    v_start_date := NOW();
    v_end_date := NOW() + (p_duration_days || ' days')::INTERVAL;

    -- Create subscription
    INSERT INTO public.user_subscriptions (
        user_id,
        plan_id,
        status,
        start_date,
        end_date,
        payment_method,
        amount_paid,
        listings_used,
        category_usage,
        metadata
    ) VALUES (
        p_user_id,
        p_plan_id,
        'active',
        v_start_date,
        v_end_date,
        CASE WHEN v_plan_record.price = 0 THEN 'free' ELSE 'pending' END,
        v_plan_record.price,
        0,
        '{}'::jsonb,
        jsonb_build_object(
            'plan_name', v_plan_record.name,
            'plan_price', v_plan_record.price,
            'activated_at', NOW()
        )
    )
    RETURNING id INTO v_subscription_id;

    -- Return success with subscription details
    RETURN jsonb_build_object(
        'success', true,
        'subscription_id', v_subscription_id,
        'plan_name', v_plan_record.name,
        'start_date', v_start_date,
        'end_date', v_end_date,
        'message', 'Plan activated successfully'
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.activate_user_plan(UUID, UUID, INTEGER) TO authenticated;

-- ============================================================
-- PART 4: Add indexes for better performance
-- ============================================================

-- Index for faster queries on listings_used
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_listings_used 
ON public.user_subscriptions(listings_used);

-- Index for faster queries on user_id and status
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status 
ON public.user_subscriptions(user_id, status);

-- Index for faster queries on plan_id
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan 
ON public.user_subscriptions(plan_id);

-- Index for faster queries on end_date (for expiration checks)
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_end_date 
ON public.user_subscriptions(end_date);

-- ============================================================
-- PART 5: Add comments for documentation
-- ============================================================

-- membership_plans comments
COMMENT ON COLUMN public.membership_plans.duration_unit IS 'Unit of time for subscription duration (days, months, years)';
COMMENT ON COLUMN public.membership_plans.duration_value IS 'Number of duration units (e.g., 1 month, 3 months, 12 months)';
COMMENT ON COLUMN public.membership_plans.currency IS 'Currency code (ETB, USD, etc.)';
COMMENT ON COLUMN public.membership_plans.badge_text IS 'Custom badge text for display (e.g., POPULAR, BEST VALUE)';

-- user_subscriptions comments
COMMENT ON COLUMN public.user_subscriptions.listings_used IS 'Total number of listings posted under this subscription';
COMMENT ON COLUMN public.user_subscriptions.category_usage IS 'JSONB object tracking posts per category, e.g., {"cars": 3, "homes": 2}';
COMMENT ON COLUMN public.user_subscriptions.amount_paid IS 'Amount paid for this subscription';
COMMENT ON COLUMN public.user_subscriptions.transaction_id IS 'Payment transaction reference ID';
COMMENT ON COLUMN public.user_subscriptions.notes IS 'Admin notes about this subscription';

-- Function comment
COMMENT ON FUNCTION public.activate_user_plan IS 'Activates a membership plan for a user. Bypasses RLS for subscription creation.';

-- ============================================================
-- PART 6: Add Usage Increment Functions & View Tracking
-- ============================================================

-- Add view_usage to user_subscriptions
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS view_usage JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.user_subscriptions.view_usage IS 'Tracks number of views per category e.g. {"cars": 5}';

-- Function to increment POST usage with logic
CREATE OR REPLACE FUNCTION public.increment_post_usage(
    p_user_id UUID,
    p_category TEXT,
    p_increment INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_sub_id UUID;
    v_current_usage INTEGER;
    v_new_usage INTEGER;
    v_limit INTEGER;
    v_result JSONB;
BEGIN
    -- Find active subscription for this user that covers this category
    SELECT 
        us.id, 
        COALESCE((us.category_usage->>p_category)::INT, 0),
        COALESCE(
            COALESCE(mp.category_limits->>p_category, mp.category_limits->>INITCAP(p_category))::INT, 
            0
        )
    INTO v_sub_id, v_current_usage, v_limit
    FROM public.user_subscriptions us
    JOIN public.membership_plans mp ON us.plan_id = mp.id
    WHERE us.user_id = p_user_id
    AND us.status = 'active'
    AND us.end_date > NOW()
    AND (
        -- Check both casings for the LIMIT key
        COALESCE(mp.category_limits->>p_category, mp.category_limits->>INITCAP(p_category))::INT = -1 
        OR 
        -- Compare usage < limit
        COALESCE((us.category_usage->>p_category)::INT, 0) < 
        COALESCE(mp.category_limits->>p_category, mp.category_limits->>INITCAP(p_category))::INT
    )
    LIMIT 1;

    IF v_sub_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'No active subscription with remaining posts for this category');
    END IF;

    -- Update the usage
    UPDATE public.user_subscriptions
    SET 
        category_usage = jsonb_set(
            COALESCE(category_usage, '{}'::jsonb),
            ARRAY[p_category],
            to_jsonb(v_current_usage + p_increment)
        ),
        listings_used = COALESCE(listings_used, 0) + p_increment
    WHERE id = v_sub_id
    RETURNING category_usage INTO v_result;

    RETURN jsonb_build_object('success', true, 'usage', v_result, 'subscription_id', v_sub_id);
END;
$$;

-- Function to increment VIEW usage with logic
CREATE OR REPLACE FUNCTION public.increment_view_usage(
    p_user_id UUID,
    p_category TEXT,
    p_increment INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_sub_id UUID;
    v_current_usage INTEGER;
    v_limit INTEGER;
    v_result JSONB;
BEGIN
    SELECT 
        us.id, 
        COALESCE((us.view_usage->>p_category)::INT, 0),
        CASE 
            WHEN (COALESCE(mp.permissions->'view_access'->>p_category, mp.permissions->'view_access'->>INITCAP(p_category))) = 'true' THEN -1
            WHEN (COALESCE(mp.permissions->'view_access'->>p_category, mp.permissions->'view_access'->>INITCAP(p_category))) = 'false' THEN 0
            ELSE COALESCE((COALESCE(mp.permissions->'view_access'->>p_category, mp.permissions->'view_access'->>INITCAP(p_category)))::INT, 0)
        END
    INTO v_sub_id, v_current_usage, v_limit
    FROM public.user_subscriptions us
    JOIN public.membership_plans mp ON us.plan_id = mp.id
    WHERE us.user_id = p_user_id
    AND us.status = 'active'
    AND us.end_date > NOW()
    AND (
        (
             CASE 
                WHEN (COALESCE(mp.permissions->'view_access'->>p_category, mp.permissions->'view_access'->>INITCAP(p_category))) = 'true' THEN -1
                WHEN (COALESCE(mp.permissions->'view_access'->>p_category, mp.permissions->'view_access'->>INITCAP(p_category))) = 'false' THEN 0
                ELSE COALESCE((COALESCE(mp.permissions->'view_access'->>p_category, mp.permissions->'view_access'->>INITCAP(p_category)))::INT, 0)
            END
        ) = -1
        OR 
        COALESCE((us.view_usage->>p_category)::INT, 0) < (
            CASE 
                WHEN (COALESCE(mp.permissions->'view_access'->>p_category, mp.permissions->'view_access'->>INITCAP(p_category))) = 'true' THEN -1
                WHEN (COALESCE(mp.permissions->'view_access'->>p_category, mp.permissions->'view_access'->>INITCAP(p_category))) = 'false' THEN 0
                ELSE COALESCE((COALESCE(mp.permissions->'view_access'->>p_category, mp.permissions->'view_access'->>INITCAP(p_category)))::INT, 0)
            END
        )
    )
    LIMIT 1;

    IF v_sub_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'No active subscription with remaining views');
    END IF;

    UPDATE public.user_subscriptions
    SET 
        view_usage = jsonb_set(
            COALESCE(view_usage, '{}'::jsonb),
            ARRAY[p_category],
            to_jsonb(v_current_usage + p_increment)
        )
    WHERE id = v_sub_id
    RETURNING view_usage INTO v_result;

    RETURN jsonb_build_object('success', true, 'usage', v_result, 'subscription_id', v_sub_id);
END;
$$;

-- Grant permissions for increment functions
GRANT EXECUTE ON FUNCTION public.increment_post_usage(UUID, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_view_usage(UUID, TEXT, INTEGER) TO authenticated;

-- ============================================================
-- PART 7: Force schema cache reload
-- ============================================================

NOTIFY pgrst, 'reload schema';

-- ============================================================
-- VERIFICATION QUERIES (Optional - comment out if not needed)
-- ============================================================

-- Verify membership_plans columns
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'membership_plans'
-- AND column_name IN ('duration_unit', 'duration_value', 'currency', 'badge_text')
-- ORDER BY column_name;

-- Verify user_subscriptions columns
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'user_subscriptions'
-- AND column_name IN ('listings_used', 'category_usage', 'amount_paid', 'transaction_id', 'notes')
-- ORDER BY column_name;

-- Verify function exists
-- SELECT routine_name, routine_type
-- FROM information_schema.routines
-- WHERE routine_name = 'activate_user_plan'
-- AND routine_schema = 'public';
