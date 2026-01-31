-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy for Admins/Owners (Full Access)
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.user_subscriptions;
CREATE POLICY "Admins can manage all subscriptions" ON public.user_subscriptions
    FOR ALL
    USING (public.is_admin());

-- Policy for Users (View Own)
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Check if is_admin() exists, if not create it (safe fallback)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'owner', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
