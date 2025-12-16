-- ============================================
-- CREATE ADMIN TABLES
-- ============================================

-- 1. System Settings Table
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Insert default settings if not exist
INSERT INTO public.system_settings (key, value)
VALUES 
    ('site_maintenance', 'false'::jsonb),
    ('allow_registrations', 'true'::jsonb),
    ('require_approval', 'true'::jsonb),
    ('max_listings_per_user', '10'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 2. Reports Table (for Content Moderation)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    target_type TEXT NOT NULL, -- 'listing', 'user', 'comment'
    target_id UUID NOT NULL,
    reporter_id UUID REFERENCES auth.users(id),
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'resolved', 'dismissed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for System Settings
CREATE POLICY "Admins can manage settings" ON public.system_settings
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    );

CREATE POLICY "Public can view settings" ON public.system_settings
    FOR SELECT USING (true);

-- RLS Policies for Reports
CREATE POLICY "Admins can manage reports" ON public.reports
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    );

CREATE POLICY "Users can create reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);
