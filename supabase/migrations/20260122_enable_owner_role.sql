-- ==============================================================================
-- ENABLE OWNER ROLE & UNIFIED ADMIN ACCESS
-- Purpose: 
-- 1. Allow 'owner' role in profiles table.
-- 2. Create is_admin() helper for consistent permissions.
-- 3. Update RLS policies so Owners have full access to everything.
-- ==============================================================================

-- 1. Update Check Constraint to allow 'owner' role
DO $$ 
BEGIN
    -- Drop old constraint if exists (name might vary, trying standard names)
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_role_check') THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_role_check;
    END IF;

    -- Add new constraint including 'owner'
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('owner', 'super_admin', 'admin', 'moderator', 'premium_user', 'user'));
EXCEPTION
    WHEN OTHERS THEN 
        RAISE NOTICE 'Constraint update warning (might already exist): %', SQLERRM;
END $$;

-- 2. Create Helper Function to consolidate Admin/Owner checks
-- This function returns TRUE if the current user is an Owner, Super Admin, or Admin.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('owner', 'super_admin', 'admin')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update Policies for Critical Admin Tables
-- We replace specific "role = 'admin'" checks with "is_admin()", automatically granting access to Owners.

-- System Settings
DROP POLICY IF EXISTS "Admins can manage settings" ON public.system_settings;
CREATE POLICY "Admins can manage settings" ON public.system_settings
    FOR ALL USING (public.is_admin());

-- Reports
DROP POLICY IF EXISTS "Admins can manage reports" ON public.reports;
CREATE POLICY "Admins can manage reports" ON public.reports
    FOR ALL USING (public.is_admin());

-- Payment Providers (Critical)
DROP POLICY IF EXISTS "Admins can manage payment providers" ON public.payment_providers;
CREATE POLICY "Admins can manage payment providers" ON public.payment_providers
    FOR ALL USING (public.is_admin());

-- Membership Plans
DROP POLICY IF EXISTS "Admins can manage plans" ON public.membership_plans;
CREATE POLICY "Admins can manage plans" ON public.membership_plans
    FOR ALL USING (public.is_admin());

-- User Subscriptions (Admin access)
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.user_subscriptions;
CREATE POLICY "Admins can manage subscriptions" ON public.user_subscriptions
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
    FOR SELECT USING (
        auth.uid() = user_id OR 
        public.is_admin()
    );

-- Payment Transactions
DROP POLICY IF EXISTS "Admins can manage transactions" ON public.payment_transactions;
CREATE POLICY "Admins can manage transactions" ON public.payment_transactions
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Users can view own transactions" ON public.payment_transactions;
CREATE POLICY "Users can view own transactions" ON public.payment_transactions
    FOR SELECT USING (
        auth.uid() = user_id OR 
        public.is_admin()
    );

-- Pages / Content
DROP POLICY IF EXISTS "Admins can manage pages" ON public.pages;
CREATE POLICY "Admins can manage pages" ON public.pages
    FOR ALL USING (public.is_admin());

-- Plan Features
DROP POLICY IF EXISTS "Admins can manage features" ON public.plan_features;
CREATE POLICY "Admins can manage features" ON public.plan_features
    FOR ALL USING (public.is_admin());

-- Profiles (Admin Viewing Powers)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id OR 
        public.is_admin()
    );

DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id OR 
        public.is_admin()
    );
