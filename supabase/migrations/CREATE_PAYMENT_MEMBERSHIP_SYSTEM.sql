-- ============================================
-- PAYMENT & MEMBERSHIP SYSTEM
-- Supports: Arif Pay, Chapa
-- Features: Customizable plans, post limits, feature access
-- ============================================

-- 1. PAYMENT PROVIDERS TABLE
CREATE TABLE IF NOT EXISTS public.payment_providers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL, -- 'arif_pay', 'chapa'
    display_name TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT FALSE,
    api_key TEXT,
    secret_key TEXT,
    webhook_secret TEXT,
    test_mode BOOLEAN DEFAULT TRUE,
    config JSONB, -- Additional provider-specific config
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default providers
INSERT INTO public.payment_providers (name, display_name, is_enabled)
VALUES 
    ('arif_pay', 'Arif Pay', false),
    ('chapa', 'Chapa', false)
ON CONFLICT DO NOTHING;

-- 2. MEMBERSHIP PLANS TABLE
CREATE TABLE IF NOT EXISTS public.membership_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'ETB',
    billing_cycle TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly', 'lifetime'
    
    -- Post Limits
    max_listings INTEGER, -- NULL = unlimited
    max_active_listings INTEGER,
    listing_duration_days INTEGER, -- How long listings stay active
    can_post_featured BOOLEAN DEFAULT FALSE,
    
    -- Access Controls
    can_read_posts BOOLEAN DEFAULT TRUE,
    can_post BOOLEAN DEFAULT TRUE,
    can_comment BOOLEAN DEFAULT TRUE,
    can_message BOOLEAN DEFAULT TRUE,
    
    -- Features
    features JSONB, -- Array of feature keys
    priority_support BOOLEAN DEFAULT FALSE,
    verified_badge BOOLEAN DEFAULT FALSE,
    analytics_access BOOLEAN DEFAULT FALSE,
    
    -- Display
    is_active BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    color TEXT, -- Hex color for UI
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default plans
INSERT INTO public.membership_plans (name, slug, description, price, billing_cycle, max_listings, max_active_listings, listing_duration_days, features, display_order)
VALUES 
    ('Free', 'free', 'Basic access with limited features', 0, 'lifetime', 5, 2, 30, 
     '["basic_search", "basic_listing"]'::jsonb, 1),
    
    ('Basic', 'basic', 'Perfect for occasional sellers', 99, 'monthly', 20, 10, 60,
     '["basic_search", "basic_listing", "image_upload", "email_support"]'::jsonb, 2),
    
    ('Pro', 'pro', 'Best for regular sellers', 299, 'monthly', 100, 50, 90,
     '["advanced_search", "featured_listing", "image_upload", "video_upload", "priority_support", "analytics"]'::jsonb, 3),
    
    ('Business', 'business', 'Unlimited posting for businesses', 999, 'monthly', NULL, NULL, 120,
     '["all_features", "unlimited_posts", "verified_badge", "premium_support", "advanced_analytics", "api_access"]'::jsonb, 4)
ON CONFLICT (slug) DO NOTHING;

-- 3. USER SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.membership_plans(id) NOT NULL,
    
    -- Status
    status TEXT DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'suspended', 'past_due'
    
    -- Dates
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    trial_end_date TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Usage Tracking
    listings_used INTEGER DEFAULT 0,
    listings_limit INTEGER, -- Cached from plan
    
    -- Billing
    auto_renew BOOLEAN DEFAULT TRUE,
    payment_provider TEXT, -- 'arif_pay', 'chapa'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, plan_id)
);

-- 4. PAYMENT TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.user_subscriptions(id),
    
    -- Transaction Details
    transaction_type TEXT NOT NULL, -- 'subscription', 'featured_listing', 'one_time'
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'ETB',
    
    -- Payment Provider
    provider TEXT NOT NULL, -- 'arif_pay', 'chapa'
    provider_transaction_id TEXT,
    provider_reference TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'refunded'
    
    -- Metadata
    payment_method TEXT, -- 'mobile_money', 'card', 'bank_transfer'
    metadata JSONB,
    error_message TEXT,
    
    -- Timestamps
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. PAYMENT WEBHOOKS LOG TABLE
CREATE TABLE IF NOT EXISTS public.payment_webhooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. PAGES TABLE (Renamed from Homepage Management)
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL, -- 'home', 'about', 'pricing', 'terms', etc.
    title TEXT NOT NULL,
    meta_description TEXT,
    
    -- Content Sections (JSON array of sections)
    sections JSONB, -- [{type: 'hero', content: {...}}, {type: 'features', content: {...}}]
    
    -- SEO
    meta_keywords TEXT[],
    og_image TEXT,
    
    -- Status
    is_published BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE, -- If false, requires login
    
    -- Display
    show_in_menu BOOLEAN DEFAULT FALSE,
    menu_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Insert default pages
INSERT INTO public.pages (slug, title, meta_description, is_published, show_in_menu, menu_order)
VALUES 
    ('home', 'Home', 'Welcome to YesraSew - Ethiopia''s Premier Marketplace', true, false, 0),
    ('pricing', 'Pricing Plans', 'Choose the perfect plan for your needs', true, true, 1),
    ('about', 'About Us', 'Learn more about YesraSew', true, true, 2),
    ('terms', 'Terms of Service', 'Terms and conditions', true, true, 3),
    ('privacy', 'Privacy Policy', 'Our privacy policy', true, true, 4)
ON CONFLICT (slug) DO NOTHING;

-- 7. PLAN FEATURES TABLE (For detailed feature management)
CREATE TABLE IF NOT EXISTS public.plan_features (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feature_key TEXT UNIQUE NOT NULL,
    feature_name TEXT NOT NULL,
    description TEXT,
    category TEXT, -- 'posting', 'access', 'support', 'analytics'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default features
INSERT INTO public.plan_features (feature_key, feature_name, description, category)
VALUES 
    ('basic_search', 'Basic Search', 'Search listings with basic filters', 'access'),
    ('advanced_search', 'Advanced Search', 'Advanced search with multiple filters', 'access'),
    ('basic_listing', 'Basic Listing', 'Create basic listings', 'posting'),
    ('featured_listing', 'Featured Listings', 'Promote listings to top of search', 'posting'),
    ('image_upload', 'Image Upload', 'Upload images to listings', 'posting'),
    ('video_upload', 'Video Upload', 'Upload videos to listings', 'posting'),
    ('email_support', 'Email Support', 'Email customer support', 'support'),
    ('priority_support', 'Priority Support', '24/7 priority customer support', 'support'),
    ('analytics', 'Basic Analytics', 'View listing performance', 'analytics'),
    ('advanced_analytics', 'Advanced Analytics', 'Detailed analytics and insights', 'analytics'),
    ('verified_badge', 'Verified Badge', 'Display verified badge on profile', 'access'),
    ('api_access', 'API Access', 'Access to developer API', 'access'),
    ('unlimited_posts', 'Unlimited Posts', 'Post unlimited listings', 'posting')
ON CONFLICT (feature_key) DO NOTHING;

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.payment_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Payment Providers: Admin only
CREATE POLICY "Admins can manage payment providers" ON public.payment_providers
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    );

-- Membership Plans: Public can view active, admins can manage
CREATE POLICY "Public can view active plans" ON public.membership_plans
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage plans" ON public.membership_plans
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    );

-- User Subscriptions: Users can view own, admins can view all
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    );

CREATE POLICY "System can create subscriptions" ON public.user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage subscriptions" ON public.user_subscriptions
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    );

-- Payment Transactions: Users can view own, admins can view all
CREATE POLICY "Users can view own transactions" ON public.payment_transactions
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    );

CREATE POLICY "Admins can manage transactions" ON public.payment_transactions
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    );

-- Pages: Public can view published, admins can manage
CREATE POLICY "Public can view published pages" ON public.pages
    FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage pages" ON public.pages
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    );

-- Plan Features: Public can view active, admins can manage
CREATE POLICY "Public can view active features" ON public.plan_features
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage features" ON public.plan_features
    FOR ALL USING (
        auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    );

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider ON public.payment_transactions(provider);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_published ON public.pages(is_published);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to check if user has feature access
CREATE OR REPLACE FUNCTION public.user_has_feature(user_uuid UUID, feature_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    has_access BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.user_subscriptions us
        JOIN public.membership_plans mp ON us.plan_id = mp.id
        WHERE us.user_id = user_uuid
        AND us.status = 'active'
        AND (us.end_date IS NULL OR us.end_date > NOW())
        AND mp.features @> to_jsonb(ARRAY[feature_key])
    ) INTO has_access;
    
    RETURN has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can post
CREATE OR REPLACE FUNCTION public.user_can_post(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    can_post BOOLEAN;
    listings_count INTEGER;
    max_listings INTEGER;
BEGIN
    -- Get user's active subscription
    SELECT 
        mp.can_post,
        mp.max_listings,
        us.listings_used
    INTO can_post, max_listings, listings_count
    FROM public.user_subscriptions us
    JOIN public.membership_plans mp ON us.plan_id = mp.id
    WHERE us.user_id = user_uuid
    AND us.status = 'active'
    AND (us.end_date IS NULL OR us.end_date > NOW())
    LIMIT 1;
    
    -- If no subscription, return false
    IF can_post IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- If can't post, return false
    IF NOT can_post THEN
        RETURN FALSE;
    END IF;
    
    -- If unlimited (NULL), return true
    IF max_listings IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Check if under limit
    RETURN listings_count < max_listings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Update listings_used when new listing is created
CREATE OR REPLACE FUNCTION public.increment_listings_used()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.user_subscriptions
    SET listings_used = listings_used + 1
    WHERE user_id = NEW.user_id
    AND status = 'active';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_listings_used
    AFTER INSERT ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION public.increment_listings_used();

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Payment & Membership system created successfully!' as message;

-- Show created tables
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'payment_providers', 'membership_plans', 'user_subscriptions',
    'payment_transactions', 'payment_webhooks', 'pages', 'plan_features'
)
ORDER BY tablename;
