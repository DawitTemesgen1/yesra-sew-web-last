-- Migration to add missing verify_ethiopian_otp RPC
-- This is used for phone and email OTP verification from the frontend

-- DROP first because return type might have changed or conflicted
DROP FUNCTION IF EXISTS verify_ethiopian_otp(text, text, text);

CREATE OR REPLACE FUNCTION verify_ethiopian_otp(p_phone TEXT, p_otp TEXT, p_purpose TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_record RECORD;
BEGIN
    -- Search for the most recent valid OTP
    SELECT * INTO v_record
    FROM public.otps
    WHERE phone = p_phone
      AND otp = p_otp
      AND purpose = p_purpose
      AND used = false
      AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1;

    -- If no record found, return failure
    IF v_record IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid or expired verification code');
    END IF;

    -- Mark OTP as used
    UPDATE public.otps SET used = true WHERE id = v_record.id;

    -- Return success
    RETURN jsonb_build_object('success', true, 'message', 'Verified successfully');
END;
$$;

-- Grant access to authenticated and anon roles
GRANT EXECUTE ON FUNCTION verify_ethiopian_otp(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_ethiopian_otp(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_ethiopian_otp(TEXT, TEXT, TEXT) TO service_role;
