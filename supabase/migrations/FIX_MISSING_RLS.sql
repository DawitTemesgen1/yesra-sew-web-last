-- ============================================
-- FIX: Enable RLS on all unsecured tables (SAFE VERSION V3)
-- ============================================

-- Function to safely enable RLS and add Service Role + Admin access
DO $$
DECLARE
    -- List of tables flagged by linter
    tables text[] := ARRAY[
        'user_views', 
        'analytics_events', 
        'notifications', 
        'audit_logs', 
        'backup_history', 
        'api_keys', 
        'security_logs', 
        'support_ticket_messages', 
        'communication_templates', 
        'communications', 
        'homepage_sections', 
        'mobile_app_versions', 
        'support_tickets'
    ];
    t text;
BEGIN
    FOREACH t IN ARRAY tables LOOP
        -- 1. Enable RLS
        EXECUTE format('ALTER TABLE IF EXISTS public.%I ENABLE ROW LEVEL SECURITY', t);
        
        -- 2. Create Service Role Policy (Backend Access)
        EXECUTE format('DROP POLICY IF EXISTS "Service role full access" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Service role full access" ON public.%I TO service_role USING (true) WITH CHECK (true)', t);

        -- 3. Create Admin Full Access Policy (Admin Panel Access)
        -- Updated: Now supports both 'admin' and 'super_admin' roles.
        EXECUTE format('DROP POLICY IF EXISTS "Admins full access" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Admins full access" ON public.%I FOR ALL USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN (''admin'', ''super_admin''))
        )', t);
    END LOOP;
END $$;


-- ============================================
-- SPECIFIC USER POLICIES (So regular users can use the app)
-- ============================================

-- 1. Notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

-- 2. User Views (Tracking)
DROP POLICY IF EXISTS "Users can record views" ON public.user_views;
CREATE POLICY "Users can record views" ON public.user_views
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Support Tickets
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
CREATE POLICY "Users can view own tickets" ON public.support_tickets
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;
CREATE POLICY "Users can create tickets" ON public.support_tickets
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Public Read Data (Homepage Sections)
-- Everyone needs to see the homepage!
DROP POLICY IF EXISTS "Public can view homepage sections" ON public.homepage_sections;
CREATE POLICY "Public can view homepage sections" ON public.homepage_sections
FOR SELECT USING (true);

-- 5. Mobile Versions (Public Check)
DROP POLICY IF EXISTS "Public can view app versions" ON public.mobile_app_versions;
CREATE POLICY "Public can view app versions" ON public.mobile_app_versions
FOR SELECT USING (true);
