-- Add view_usage column and increment functions

-- 1. Add view_usage to user_subscriptions
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS view_usage JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.user_subscriptions.view_usage IS 'Tracks number of views per category e.g. {"cars": 5}';

-- 2. Function to increment POST usage
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
    -- We prioritize plans with available remaining balance
    -- Logic: Find sub where (limit = -1) OR (usage < limit)
    
    SELECT 
        us.id, 
        COALESCE((us.category_usage->>p_category)::INT, 0),
        COALESCE((mp.category_limits->>p_category)::INT, 0)
    INTO v_sub_id, v_current_usage, v_limit
    FROM public.user_subscriptions us
    JOIN public.membership_plans mp ON us.plan_id = mp.id
    WHERE us.user_id = p_user_id
    AND us.status = 'active'
    AND us.end_date > NOW()
    AND (
        (mp.category_limits->>p_category)::INT = -1 
        OR 
        COALESCE((us.category_usage->>p_category)::INT, 0) < (mp.category_limits->>p_category)::INT
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

-- 3. Function to increment VIEW usage
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
    -- Find active subscription for this user that covers this category's VIEW limit
    -- Note: View limits are stored in 'permissions' column: permissions->'view_access'->'category'
    
    SELECT 
        us.id, 
        COALESCE((us.view_usage->>p_category)::INT, 0),
        -- Handle boolean vs number in permissions
        CASE 
            WHEN (mp.permissions->'view_access'->>p_category) = 'true' THEN -1
            WHEN (mp.permissions->'view_access'->>p_category) = 'false' THEN 0
            ELSE COALESCE((mp.permissions->'view_access'->>p_category)::INT, 0)
        END
    INTO v_sub_id, v_current_usage, v_limit
    FROM public.user_subscriptions us
    JOIN public.membership_plans mp ON us.plan_id = mp.id
    WHERE us.user_id = p_user_id
    AND us.status = 'active'
    AND us.end_date > NOW()
    AND (
        -- Check limit: if -1 (unlimited) OR usage < limit
        (
             CASE 
                WHEN (mp.permissions->'view_access'->>p_category) = 'true' THEN -1
                WHEN (mp.permissions->'view_access'->>p_category) = 'false' THEN 0
                ELSE COALESCE((mp.permissions->'view_access'->>p_category)::INT, 0)
            END
        ) = -1
        OR 
        COALESCE((us.view_usage->>p_category)::INT, 0) < (
            CASE 
                WHEN (mp.permissions->'view_access'->>p_category) = 'true' THEN -1
                WHEN (mp.permissions->'view_access'->>p_category) = 'false' THEN 0
                ELSE COALESCE((mp.permissions->'view_access'->>p_category)::INT, 0)
            END
        )
    )
    LIMIT 1;

    IF v_sub_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'No active subscription with remaining views');
    END IF;

    -- Update the usage
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.increment_post_usage(UUID, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_view_usage(UUID, TEXT, INTEGER) TO authenticated;

-- Force schema reload
NOTIFY pgrst, 'reload schema';
