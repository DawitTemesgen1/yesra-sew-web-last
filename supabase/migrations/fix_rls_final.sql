-- Drop potentially restrictive or malformed policies
DROP POLICY IF EXISTS "Admin full access for plans" ON public.membership_plans;
DROP POLICY IF EXISTS "Public read access for plans" ON public.membership_plans;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.membership_plans;
DROP POLICY IF EXISTS "Allow public read access" ON public.membership_plans;

-- 1. Public Read Access (Essential for Pricing Page)
CREATE POLICY "Public read access" ON public.membership_plans
    FOR SELECT
    USING (true);

-- 2. Authenticated Admin Access (Full Control)
-- This allows any logged-in user to Create, Update, Delete plans.
-- In production, you should check for specific admin role (e.g., auth.jwt()->>'role' = 'admin')
CREATE POLICY "Admin full access" ON public.membership_plans
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Force schema reload
NOTIFY pgrst, 'reload schema';
