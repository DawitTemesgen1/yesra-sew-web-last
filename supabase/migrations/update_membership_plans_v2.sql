-- Add missing columns to support MembershipPlansScreen
ALTER TABLE public.membership_plans
ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS listing_duration_days INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb;

-- Ensure permissions are broad enough for development
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.membership_plans;
CREATE POLICY "Allow authenticated full access" ON public.membership_plans
    FOR ALL USING (auth.role() = 'authenticated');
