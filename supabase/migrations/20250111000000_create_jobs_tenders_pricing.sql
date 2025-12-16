-- ============================================
-- JOBS & TENDERS PRICING SYSTEM
-- Independent pricing plans for Jobs and Tenders
-- Each with Premium and Freemium tiers
-- ============================================

-- 1. CREATE PRICING PLANS TABLE FOR JOBS & TENDERS
CREATE TABLE IF NOT EXISTS public.listing_pricing_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_slug TEXT NOT NULL, -- 'jobs' or 'tenders'
    plan_type TEXT NOT NULL CHECK (plan_type IN ('freemium', 'premium')),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'ETB',
    
    -- Duration & Limits
    duration_days INTEGER DEFAULT 30, -- How long the listing stays active
    max_listings_per_month INTEGER, -- NULL = unlimited
    max_active_listings INTEGER, -- NULL = unlimited
    
    -- Features
    featured_listing BOOLEAN DEFAULT FALSE, -- Top placement in search
    priority_placement BOOLEAN DEFAULT FALSE, -- Higher in search results
    highlighted BOOLEAN DEFAULT FALSE, -- Visual highlight (border, badge)
    social_media_promotion BOOLEAN DEFAULT FALSE, -- Auto-share on social media
    email_notifications BOOLEAN DEFAULT TRUE, -- Get applicant/bidder notifications
    analytics_access BOOLEAN DEFAULT FALSE, -- View detailed analytics
    verified_badge BOOLEAN DEFAULT FALSE, -- Show verified badge
    urgent_tag BOOLEAN DEFAULT FALSE, -- Show "URGENT" tag
    
    -- Contact & Visibility
    show_contact_info BOOLEAN DEFAULT TRUE, -- Show phone/email
    allow_applications BOOLEAN DEFAULT TRUE, -- For jobs: allow applications
    allow_bids BOOLEAN DEFAULT TRUE, -- For tenders: allow bids
    max_images INTEGER DEFAULT 3, -- Number of images allowed
    max_videos INTEGER DEFAULT 0, -- Number of videos allowed
    can_attach_documents BOOLEAN DEFAULT FALSE, -- Attach PDFs, docs
    
    -- Support & Extras
    priority_support BOOLEAN DEFAULT FALSE,
    auto_renewal BOOLEAN DEFAULT FALSE, -- Auto-renew when expires
    bump_up_count INTEGER DEFAULT 0, -- Number of times can bump to top
    
    -- Display
    is_active BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    badge_color TEXT, -- Color for plan badge
    badge_text TEXT, -- Text for plan badge (e.g., "BEST VALUE")
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(category_slug, plan_type)
);

-- 2. INSERT DEFAULT PRICING PLANS

-- ============================================
-- JOBS PRICING PLANS
-- ============================================

-- Jobs - Freemium Plan
INSERT INTO public.listing_pricing_plans (
    category_slug, plan_type, name, description, price, duration_days,
    max_listings_per_month, max_active_listings, featured_listing, priority_placement,
    highlighted, social_media_promotion, analytics_access, verified_badge, urgent_tag,
    show_contact_info, allow_applications, max_images, max_videos, can_attach_documents,
    priority_support, auto_renewal, bump_up_count, is_popular, display_order, badge_color, badge_text
) VALUES (
    'jobs', 'freemium', 'Free Job Posting', 
    'Post job listings for free with basic features',
    0, -- Free
    30, -- 30 days active
    3, -- Max 3 listings per month
    2, -- Max 2 active at once
    FALSE, -- No featured listing
    FALSE, -- No priority placement
    FALSE, -- No highlighting
    FALSE, -- No social media promotion
    FALSE, -- No analytics
    FALSE, -- No verified badge
    FALSE, -- No urgent tag
    TRUE, -- Show contact info
    TRUE, -- Allow applications
    2, -- Max 2 images
    0, -- No videos
    FALSE, -- No document attachments
    FALSE, -- No priority support
    FALSE, -- No auto-renewal
    0, -- No bump-ups
    FALSE, -- Not popular
    1, -- Display order
    '#9E9E9E', -- Gray badge
    'FREE'
) ON CONFLICT (category_slug, plan_type) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    duration_days = EXCLUDED.duration_days,
    max_listings_per_month = EXCLUDED.max_listings_per_month,
    max_active_listings = EXCLUDED.max_active_listings,
    updated_at = NOW();

-- Jobs - Premium Plan
INSERT INTO public.listing_pricing_plans (
    category_slug, plan_type, name, description, price, duration_days,
    max_listings_per_month, max_active_listings, featured_listing, priority_placement,
    highlighted, social_media_promotion, analytics_access, verified_badge, urgent_tag,
    show_contact_info, allow_applications, max_images, max_videos, can_attach_documents,
    priority_support, auto_renewal, bump_up_count, is_popular, display_order, badge_color, badge_text
) VALUES (
    'jobs', 'premium', 'Premium Job Posting', 
    'Get maximum visibility for your job postings with premium features',
    499, -- 499 ETB
    60, -- 60 days active
    NULL, -- Unlimited listings per month
    NULL, -- Unlimited active listings
    TRUE, -- Featured listing (top placement)
    TRUE, -- Priority placement
    TRUE, -- Highlighted with border
    TRUE, -- Social media promotion
    TRUE, -- Full analytics access
    TRUE, -- Verified badge
    TRUE, -- Urgent tag available
    TRUE, -- Show contact info
    TRUE, -- Allow applications
    10, -- Max 10 images
    2, -- Max 2 videos
    TRUE, -- Can attach documents (job descriptions, etc.)
    TRUE, -- Priority support
    TRUE, -- Auto-renewal option
    5, -- 5 bump-ups to top
    TRUE, -- Mark as popular
    2, -- Display order
    '#FFD700', -- Gold badge
    'PREMIUM'
) ON CONFLICT (category_slug, plan_type) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    duration_days = EXCLUDED.duration_days,
    max_listings_per_month = EXCLUDED.max_listings_per_month,
    max_active_listings = EXCLUDED.max_active_listings,
    updated_at = NOW();

-- ============================================
-- TENDERS PRICING PLANS
-- ============================================

-- Tenders - Freemium Plan
INSERT INTO public.listing_pricing_plans (
    category_slug, plan_type, name, description, price, duration_days,
    max_listings_per_month, max_active_listings, featured_listing, priority_placement,
    highlighted, social_media_promotion, analytics_access, verified_badge, urgent_tag,
    show_contact_info, allow_bids, max_images, max_videos, can_attach_documents,
    priority_support, auto_renewal, bump_up_count, is_popular, display_order, badge_color, badge_text
) VALUES (
    'tenders', 'freemium', 'Free Tender Posting', 
    'Post tender announcements for free with basic features',
    0, -- Free
    45, -- 45 days active (tenders usually longer)
    2, -- Max 2 tenders per month
    1, -- Max 1 active at once
    FALSE, -- No featured listing
    FALSE, -- No priority placement
    FALSE, -- No highlighting
    FALSE, -- No social media promotion
    FALSE, -- No analytics
    FALSE, -- No verified badge
    FALSE, -- No urgent tag
    TRUE, -- Show contact info
    TRUE, -- Allow bids
    3, -- Max 3 images
    0, -- No videos
    FALSE, -- No document attachments
    FALSE, -- No priority support
    FALSE, -- No auto-renewal
    0, -- No bump-ups
    FALSE, -- Not popular
    1, -- Display order
    '#9E9E9E', -- Gray badge
    'FREE'
) ON CONFLICT (category_slug, plan_type) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    duration_days = EXCLUDED.duration_days,
    max_listings_per_month = EXCLUDED.max_listings_per_month,
    max_active_listings = EXCLUDED.max_active_listings,
    updated_at = NOW();

-- Tenders - Premium Plan
INSERT INTO public.listing_pricing_plans (
    category_slug, plan_type, name, description, price, duration_days,
    max_listings_per_month, max_active_listings, featured_listing, priority_placement,
    highlighted, social_media_promotion, analytics_access, verified_badge, urgent_tag,
    show_contact_info, allow_bids, max_images, max_videos, can_attach_documents,
    priority_support, auto_renewal, bump_up_count, is_popular, display_order, badge_color, badge_text
) VALUES (
    'tenders', 'premium', 'Premium Tender Posting', 
    'Maximize reach for your tenders with premium features and priority placement',
    799, -- 799 ETB (higher than jobs as tenders are typically larger)
    90, -- 90 days active
    NULL, -- Unlimited tenders per month
    NULL, -- Unlimited active tenders
    TRUE, -- Featured listing (top placement)
    TRUE, -- Priority placement
    TRUE, -- Highlighted with border
    TRUE, -- Social media promotion
    TRUE, -- Full analytics access
    TRUE, -- Verified badge
    TRUE, -- Urgent tag available
    TRUE, -- Show contact info
    TRUE, -- Allow bids
    15, -- Max 15 images
    3, -- Max 3 videos
    TRUE, -- Can attach tender documents
    TRUE, -- Priority support
    TRUE, -- Auto-renewal option
    10, -- 10 bump-ups to top
    TRUE, -- Mark as popular
    2, -- Display order
    '#FFD700', -- Gold badge
    'PREMIUM'
) ON CONFLICT (category_slug, plan_type) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    duration_days = EXCLUDED.duration_days,
    max_listings_per_month = EXCLUDED.max_listings_per_month,
    max_active_listings = EXCLUDED.max_active_listings,
    updated_at = NOW();

-- 3. CREATE USER LISTING SUBSCRIPTIONS TABLE
-- Tracks which plan a user has purchased for their listing
CREATE TABLE IF NOT EXISTS public.user_listing_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.listing_pricing_plans(id) NOT NULL,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending_payment')),
    
    -- Dates
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- Payment
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_method TEXT, -- 'arif_pay', 'chapa', 'free'
    transaction_id UUID REFERENCES public.payment_transactions(id),
    
    -- Usage tracking
    bump_ups_used INTEGER DEFAULT 0,
    bump_ups_remaining INTEGER DEFAULT 0,
    
    -- Metadata
    auto_renew BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE MONTHLY USAGE TRACKING TABLE
-- Track how many listings a user has posted per month for freemium limits
CREATE TABLE IF NOT EXISTS public.user_monthly_listing_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_slug TEXT NOT NULL, -- 'jobs' or 'tenders'
    month DATE NOT NULL, -- First day of the month
    listings_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, category_slug, month)
);

-- 5. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_listing_pricing_plans_category ON public.listing_pricing_plans(category_slug);
CREATE INDEX IF NOT EXISTS idx_listing_pricing_plans_active ON public.listing_pricing_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_user_listing_subscriptions_user ON public.user_listing_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_listing_subscriptions_listing ON public.user_listing_subscriptions(listing_id);
CREATE INDEX IF NOT EXISTS idx_user_listing_subscriptions_status ON public.user_listing_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_monthly_usage_user_category ON public.user_monthly_listing_usage(user_id, category_slug);

-- 6. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.listing_pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_listing_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_monthly_listing_usage ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES

-- Pricing Plans: Public can view active plans
CREATE POLICY "public_view_active_pricing_plans" ON public.listing_pricing_plans
    FOR SELECT USING (is_active = true);

CREATE POLICY "admins_manage_pricing_plans" ON public.listing_pricing_plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- User Listing Subscriptions: Users can view own, admins can view all
CREATE POLICY "users_view_own_listing_subscriptions" ON public.user_listing_subscriptions
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "users_create_listing_subscriptions" ON public.user_listing_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins_manage_listing_subscriptions" ON public.user_listing_subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Monthly Usage: Users can view own
CREATE POLICY "users_view_own_usage" ON public.user_monthly_listing_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "system_manage_usage" ON public.user_monthly_listing_usage
    FOR ALL USING (true); -- System needs to update this

-- 8. HELPER FUNCTIONS

-- Function to check if user can post in category (respects freemium limits)
CREATE OR REPLACE FUNCTION public.user_can_post_in_category(
    user_uuid UUID, 
    category TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    current_month DATE;
    monthly_count INTEGER;
    max_allowed INTEGER;
    active_count INTEGER;
    max_active INTEGER;
    has_premium BOOLEAN;
BEGIN
    current_month := DATE_TRUNC('month', NOW())::DATE;
    
    -- Check if user has active premium subscription for this category
    SELECT EXISTS (
        SELECT 1 FROM public.user_listing_subscriptions uls
        JOIN public.listing_pricing_plans lpp ON uls.plan_id = lpp.id
        WHERE uls.user_id = user_uuid
        AND lpp.category_slug = category
        AND lpp.plan_type = 'premium'
        AND uls.status = 'active'
        AND (uls.end_date IS NULL OR uls.end_date > NOW())
    ) INTO has_premium;
    
    -- Premium users have unlimited access
    IF has_premium THEN
        RETURN TRUE;
    END IF;
    
    -- Get freemium plan limits
    SELECT max_listings_per_month, max_active_listings
    INTO max_allowed, max_active
    FROM public.listing_pricing_plans
    WHERE category_slug = category
    AND plan_type = 'freemium'
    AND is_active = true;
    
    -- Get current month's usage
    SELECT COALESCE(listings_count, 0)
    INTO monthly_count
    FROM public.user_monthly_listing_usage
    WHERE user_id = user_uuid
    AND category_slug = category
    AND month = current_month;
    
    -- Check monthly limit
    IF max_allowed IS NOT NULL AND monthly_count >= max_allowed THEN
        RETURN FALSE;
    END IF;
    
    -- Get active listings count
    SELECT COUNT(*)
    INTO active_count
    FROM public.listings
    WHERE user_id = user_uuid
    AND category_id = (SELECT id FROM public.categories WHERE slug = category)
    AND status IN ('active', 'approved', 'pending');
    
    -- Check active limit
    IF max_active IS NOT NULL AND active_count >= max_active THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's plan for a category
CREATE OR REPLACE FUNCTION public.get_user_plan_for_category(
    user_uuid UUID,
    category TEXT
)
RETURNS TABLE (
    plan_type TEXT,
    plan_name TEXT,
    is_premium BOOLEAN,
    features JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lpp.plan_type,
        lpp.name,
        (lpp.plan_type = 'premium') as is_premium,
        jsonb_build_object(
            'featured_listing', lpp.featured_listing,
            'priority_placement', lpp.priority_placement,
            'highlighted', lpp.highlighted,
            'analytics_access', lpp.analytics_access,
            'max_images', lpp.max_images,
            'max_videos', lpp.max_videos,
            'can_attach_documents', lpp.can_attach_documents,
            'bump_up_count', lpp.bump_up_count
        ) as features
    FROM public.user_listing_subscriptions uls
    JOIN public.listing_pricing_plans lpp ON uls.plan_id = lpp.id
    WHERE uls.user_id = user_uuid
    AND lpp.category_slug = category
    AND uls.status = 'active'
    AND (uls.end_date IS NULL OR uls.end_date > NOW())
    ORDER BY lpp.plan_type DESC -- Premium first
    LIMIT 1;
    
    -- If no active subscription, return freemium
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            lpp.plan_type,
            lpp.name,
            FALSE as is_premium,
            jsonb_build_object(
                'featured_listing', lpp.featured_listing,
                'priority_placement', lpp.priority_placement,
                'highlighted', lpp.highlighted,
                'analytics_access', lpp.analytics_access,
                'max_images', lpp.max_images,
                'max_videos', lpp.max_videos,
                'can_attach_documents', lpp.can_attach_documents,
                'bump_up_count', lpp.bump_up_count
            ) as features
        FROM public.listing_pricing_plans lpp
        WHERE lpp.category_slug = category
        AND lpp.plan_type = 'freemium'
        AND lpp.is_active = true
        LIMIT 1;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. TRIGGERS

-- Update updated_at timestamp
CREATE TRIGGER update_listing_pricing_plans_updated_at
    BEFORE UPDATE ON public.listing_pricing_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_listing_subscriptions_updated_at
    BEFORE UPDATE ON public.user_listing_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Increment monthly usage when listing is created
CREATE OR REPLACE FUNCTION increment_monthly_listing_usage()
RETURNS TRIGGER AS $$
DECLARE
    current_month DATE;
    category TEXT;
BEGIN
    current_month := DATE_TRUNC('month', NOW())::DATE;
    
    -- Get category slug
    SELECT slug INTO category
    FROM public.categories
    WHERE id = NEW.category_id;
    
    -- Only track for jobs and tenders
    IF category IN ('jobs', 'tenders') THEN
        INSERT INTO public.user_monthly_listing_usage (user_id, category_slug, month, listings_count)
        VALUES (NEW.user_id, category, current_month, 1)
        ON CONFLICT (user_id, category_slug, month)
        DO UPDATE SET 
            listings_count = public.user_monthly_listing_usage.listings_count + 1,
            updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_monthly_listing_usage
    AFTER INSERT ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION increment_monthly_listing_usage();

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Jobs & Tenders Pricing System created successfully!' as message;

-- Show created pricing plans
SELECT 
    category_slug,
    plan_type,
    name,
    price,
    duration_days,
    max_listings_per_month,
    is_popular
FROM public.listing_pricing_plans
ORDER BY category_slug, display_order;
