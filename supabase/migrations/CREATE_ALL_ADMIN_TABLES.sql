-- ============================================
-- CREATE ALL ADMIN TABLES
-- Run this script to set up all admin functionality
-- ============================================

-- 1. SYSTEM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Insert default settings
INSERT INTO public.system_settings (key, value)
VALUES 
    ('site_maintenance', 'false'::jsonb),
    ('allow_registrations', 'true'::jsonb),
    ('require_approval', 'true'::jsonb),
    ('max_listings_per_user', '10'::jsonb),
    ('site_name', '"YesraSew"'::jsonb),
    ('contact_email', '"info@yesrasew.com"'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 2. REPORTS TABLE (Content Moderation)
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
    resolved_by UUID REFERENCES auth.users(id),
    notes TEXT
);

-- 3. ANALYTICS EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL, -- 'page_view', 'listing_view', 'search', 'click'
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT,
    page_url TEXT,
    referrer TEXT,
    listing_id UUID REFERENCES public.listings(id),
    category_id UUID REFERENCES public.categories(id),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- 'info', 'success', 'warning', 'error'
    link TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SUPPORT TICKETS TABLE
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    category TEXT,
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 6. HELP ARTICLES TABLE
CREATE TABLE IF NOT EXISTS public.help_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    tags TEXT[],
    published BOOLEAN DEFAULT FALSE,
    views INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 7. COMPANIES TABLE (Business Accounts)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    verified BOOLEAN DEFAULT FALSE,
    owner_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. SUBSCRIPTIONS TABLE (Membership)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    plan_name TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'past_due'
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'ETB',
    billing_cycle TEXT DEFAULT 'monthly', -- 'monthly', 'yearly'
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TRANSACTIONS TABLE (Financial)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    type TEXT NOT NULL, -- 'payment', 'refund', 'payout', 'fee'
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'ETB',
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    payment_method TEXT,
    reference_id TEXT,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. HOMEPAGE SECTIONS TABLE (CMS)
CREATE TABLE IF NOT EXISTS public.homepage_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_type TEXT NOT NULL, -- 'hero', 'featured', 'categories', 'testimonials'
    title TEXT,
    content JSONB,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- System Settings: Admins can manage, public can view
CREATE POLICY "Admins can manage settings" ON public.system_settings
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    );

CREATE POLICY "Public can view settings" ON public.system_settings
    FOR SELECT USING (true);

-- Reports: Admins can manage, users can create
CREATE POLICY "Admins can manage reports" ON public.reports
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    );

CREATE POLICY "Users can create reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Notifications: Users can view their own
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Support Tickets: Users can view/create own, admins can view all
CREATE POLICY "Users can view own tickets" ON public.support_tickets
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    );

CREATE POLICY "Users can create tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update tickets" ON public.support_tickets
    FOR UPDATE USING (
        auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    );

-- Help Articles: Public can view published, admins can manage
CREATE POLICY "Public can view published articles" ON public.help_articles
    FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage articles" ON public.help_articles
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    );

-- Companies: Public can view verified, owners can manage own
CREATE POLICY "Public can view verified companies" ON public.companies
    FOR SELECT USING (verified = true);

CREATE POLICY "Owners can manage own company" ON public.companies
    FOR ALL USING (auth.uid() = owner_id);

-- Subscriptions: Users can view own
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Transactions: Users can view own, admins can view all
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    );

-- Homepage Sections: Public can view active, admins can manage
CREATE POLICY "Public can view active sections" ON public.homepage_sections
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage sections" ON public.homepage_sections
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    );

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_target ON public.reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Admin tables created successfully!' as message;

-- Show created tables
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'system_settings', 'reports', 'analytics_events', 'notifications',
    'support_tickets', 'help_articles', 'companies', 'subscriptions',
    'transactions', 'homepage_sections'
)
ORDER BY tablename;
