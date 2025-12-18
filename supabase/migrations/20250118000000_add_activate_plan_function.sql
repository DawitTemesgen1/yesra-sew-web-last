-- Function to activate a plan for a user (bypasses RLS)
CREATE OR REPLACE FUNCTION public.activate_user_plan(
    p_user_id UUID,
    p_plan_id UUID,
    p_duration_days INTEGER DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS
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
        metadata
    ) VALUES (
        p_user_id,
        p_plan_id,
        'active',
        v_start_date,
        v_end_date,
        CASE WHEN v_plan_record.price = 0 THEN 'free' ELSE 'pending' END,
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

-- Comment for documentation
COMMENT ON FUNCTION public.activate_user_plan IS 'Activates a membership plan for a user. Bypasses RLS for subscription creation.';
