-- ============================================
-- INTEGRATED MEMBERSHIP & PRICING SYSTEM
-- Jobs & Tenders restricted to verified companies/admins
-- Pricing integrated with membership plans
-- ============================================

-- 1. UPDATE PROFILES TABLE - Add company verification
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS company_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS company_verification_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS company_documents JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS business_license TEXT,
ADD COLUMN IF NOT EXISTS tin_number TEXT; -- Tax Identification Number

-- 2. EXTEND MEMBERSHIP PLANS TABLE
-- Add category-specific features to existing membership_plans
ALTER TABLE public.membership_plans
ADD COLUMN IF NOT EXISTS can_post_jobs BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS can_post_tenders BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS jobs_monthly_limit INTEGER,
ADD COLUMN IF NOT EXISTS tenders_monthly_limit INTEGER,
ADD COLUMN IF NOT EXISTS jobs_features JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tenders_features JSONB DEFAULT '{}';

-- 3. UPDATE EXISTING MEMBERSHIP PLANS WITH JOBS & TENDERS ACCESS

-- Free Plan - No Jobs/Tenders access
UPDATE public.membership_plans
SET 
    can_post_jobs = FALSE,
    can_post_tenders = FALSE,
    jobs_monthly_limit = 0,
    tenders_monthly_limit = 0
WHERE slug = 'free';

-- Basic Plan - Limited Jobs access for verified companies
UPDATE public.membership_plans
SET 
    can_post_jobs = TRUE,
    can_post_tenders = FALSE,
    jobs_monthly_limit = 3,
    tenders_monthly_limit = 0,
    jobs_features = '{
        "duration_days": 30,
        "max_images": 2,
        "max_videos": 0,
        "featured_listing": false,
        "priority_placement": false,
        "analytics_access": false,
        "can_attach_documents": false,
        "bump_up_count": 0
    }'::jsonb
WHERE slug = 'basic';

-- Pro Plan - Full Jobs + Limited Tenders
UPDATE public.membership_plans
SET 
    can_post_jobs = TRUE,
    can_post_tenders = TRUE,
    jobs_monthly_limit = 20,
    tenders_monthly_limit = 5,
    jobs_features = '{
        "duration_days": 60,
        "max_images": 10,
        "max_videos": 2,
        "featured_listing": true,
        "priority_placement": true,
        "analytics_access": true,
        "can_attach_documents": true,
        "bump_up_count": 5,
        "verified_badge": true,
        "urgent_tag": true
    }'::jsonb,
    tenders_features = '{
        "duration_days": 60,
        "max_images": 10,
        "max_videos": 2,
        "featured_listing": false,
        "priority_placement": true,
        "analytics_access": true,
        "can_attach_documents": true,
        "bump_up_count": 3
    }'::jsonb
WHERE slug = 'pro';

-- Business Plan - Unlimited Jobs & Tenders
UPDATE public.membership_plans
SET 
    can_post_jobs = TRUE,
    can_post_tenders = TRUE,
    jobs_monthly_limit = NULL, -- Unlimited
    tenders_monthly_limit = NULL, -- Unlimited
    jobs_features = '{
        "duration_days": 90,
        "max_images": 15,
        "max_videos": 3,
        "featured_listing": true,
        "priority_placement": true,
        "analytics_access": true,
        "can_attach_documents": true,
        "bump_up_count": 10,
        "verified_badge": true,
        "urgent_tag": true,
        "social_media_promotion": true,
        "priority_support": true
    }'::jsonb,
    tenders_features = '{
        "duration_days": 90,
        "max_images": 20,
        "max_videos": 5,
        "featured_listing": true,
        "priority_placement": true,
        "analytics_access": true,
        "can_attach_documents": true,
        "bump_up_count": 15,
        "verified_badge": true,
        "urgent_tag": true,
        "social_media_promotion": true,
        "priority_support": true
    }'::jsonb
WHERE slug = 'business';

-- 4. CREATE CATEGORY USAGE TRACKING TABLE
-- Track monthly usage per category within membership
CREATE TABLE IF NOT EXISTS public.membership_category_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE CASCADE,
    category_slug TEXT NOT NULL, -- 'jobs', 'tenders', 'cars', 'homes'
    month DATE NOT NULL, -- First day of month
    posts_count INTEGER DEFAULT 0,
    featured_count INTEGER DEFAULT 0,
    bump_ups_used INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, category_slug, month)
);

CREATE INDEX IF NOT EXISTS idx_membership_category_usage_user ON public.membership_category_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_membership_category_usage_month ON public.membership_category_usage(month);

-- 5. ENABLE RLS
ALTER TABLE public.membership_category_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "users_view_own_category_usage" ON public.membership_category_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "system_manage_category_usage" ON public.membership_category_usage
    FOR ALL USING (true);

-- 6. HELPER FUNCTIONS

-- Check if user can post jobs/tenders (must be verified company or admin)
CREATE OR REPLACE FUNCTION public.user_can_post_jobs_tenders(
    user_uuid UUID,
    category TEXT -- 'jobs' or 'tenders'
)
RETURNS JSONB AS $$
DECLARE
    user_profile RECORD;
    user_subscription RECORD;
    current_month DATE;
    monthly_usage INTEGER;
    monthly_limit INTEGER;
    result JSONB;
BEGIN
    current_month := DATE_TRUNC('month', NOW())::DATE;
    
    -- Get user profile
    SELECT * INTO user_profile
    FROM public.profiles
    WHERE id = user_uuid;
    
    -- Check if user is admin
    IF user_profile.role IN ('admin', 'super_admin') THEN
        RETURN jsonb_build_object(
            'can_post', true,
            'reason', 'admin_access',
            'is_admin', true,
            'features', jsonb_build_object(
                'duration_days', 90,
                'max_images', 20,
                'max_videos', 5,
                'featured_listing', true,
                'priority_placement', true,
                'analytics_access', true,
                'can_attach_documents', true,
                'verified_badge', true,
                'unlimited', true
            )
        );
    END IF;
    
    -- Check if company is verified
    IF user_profile.account_type = 'business' AND NOT COALESCE(user_profile.company_verified, false) THEN
        RETURN jsonb_build_object(
            'can_post', false,
            'reason', 'company_not_verified',
            'message', 'Your company must be verified to post jobs and tenders. Please submit verification documents.'
        );
    END IF;
    
    -- Individual accounts cannot post jobs/tenders
    IF user_profile.account_type = 'individual' THEN
        RETURN jsonb_build_object(
            'can_post', false,
            'reason', 'individual_account',
            'message', 'Only verified companies can post jobs and tenders. Please upgrade to a business account.'
        );
    END IF;
    
    -- Get active subscription
    SELECT 
        us.*,
        mp.can_post_jobs,
        mp.can_post_tenders,
        mp.jobs_monthly_limit,
        mp.tenders_monthly_limit,
        CASE 
            WHEN category = 'jobs' THEN mp.jobs_features
            WHEN category = 'tenders' THEN mp.tenders_features
            ELSE '{}'::jsonb
        END as category_features
    INTO user_subscription
    FROM public.user_subscriptions us
    JOIN public.membership_plans mp ON us.plan_id = mp.id
    WHERE us.user_id = user_uuid
    AND us.status = 'active'
    AND (us.end_date IS NULL OR us.end_date > NOW())
    ORDER BY mp.price DESC -- Get highest tier plan
    LIMIT 1;
    
    -- No active subscription
    IF user_subscription IS NULL THEN
        RETURN jsonb_build_object(
            'can_post', false,
            'reason', 'no_subscription',
            'message', 'You need an active membership plan to post jobs and tenders.'
        );
    END IF;
    
    -- Check if plan allows this category
    IF category = 'jobs' AND NOT user_subscription.can_post_jobs THEN
        RETURN jsonb_build_object(
            'can_post', false,
            'reason', 'plan_restriction',
            'message', 'Your current plan does not include job posting. Please upgrade.'
        );
    END IF;
    
    IF category = 'tenders' AND NOT user_subscription.can_post_tenders THEN
        RETURN jsonb_build_object(
            'can_post', false,
            'reason', 'plan_restriction',
            'message', 'Your current plan does not include tender posting. Please upgrade.'
        );
    END IF;
    
    -- Get monthly usage
    SELECT COALESCE(posts_count, 0) INTO monthly_usage
    FROM public.membership_category_usage
    WHERE user_id = user_uuid
    AND category_slug = category
    AND month = current_month;
    
    -- Get monthly limit
    IF category = 'jobs' THEN
        monthly_limit := user_subscription.jobs_monthly_limit;
    ELSE
        monthly_limit := user_subscription.tenders_monthly_limit;
    END IF;
    
    -- Check limit (NULL = unlimited)
    IF monthly_limit IS NOT NULL AND monthly_usage >= monthly_limit THEN
        RETURN jsonb_build_object(
            'can_post', false,
            'reason', 'monthly_limit_reached',
            'message', format('You have reached your monthly limit of %s %s posts. Upgrade for more.', monthly_limit, category),
            'usage', monthly_usage,
            'limit', monthly_limit
        );
    END IF;
    
    -- User can post!
    RETURN jsonb_build_object(
        'can_post', true,
        'reason', 'verified_company_with_plan',
        'is_verified', true,
        'plan_name', (SELECT name FROM public.membership_plans WHERE id = user_subscription.plan_id),
        'features', user_subscription.category_features,
        'usage', COALESCE(monthly_usage, 0),
        'limit', monthly_limit,
        'unlimited', monthly_limit IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's membership details with category access
CREATE OR REPLACE FUNCTION public.get_user_membership_details(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    subscription RECORD;
    jobs_usage INTEGER;
    tenders_usage INTEGER;
    current_month DATE;
BEGIN
    current_month := DATE_TRUNC('month', NOW())::DATE;
    
    -- Get active subscription
    SELECT 
        us.*,
        mp.name as plan_name,
        mp.slug as plan_slug,
        mp.can_post_jobs,
        mp.can_post_tenders,
        mp.jobs_monthly_limit,
        mp.tenders_monthly_limit,
        mp.jobs_features,
        mp.tenders_features,
        mp.max_listings,
        mp.max_active_listings,
        mp.features as general_features
    INTO subscription
    FROM public.user_subscriptions us
    JOIN public.membership_plans mp ON us.plan_id = mp.id
    WHERE us.user_id = user_uuid
    AND us.status = 'active'
    AND (us.end_date IS NULL OR us.end_date > NOW())
    ORDER BY mp.price DESC
    LIMIT 1;
    
    IF subscription IS NULL THEN
        RETURN jsonb_build_object(
            'has_subscription', false,
            'message', 'No active membership'
        );
    END IF;
    
    -- Get usage stats
    SELECT COALESCE(posts_count, 0) INTO jobs_usage
    FROM public.membership_category_usage
    WHERE user_id = user_uuid
    AND category_slug = 'jobs'
    AND month = current_month;
    
    SELECT COALESCE(posts_count, 0) INTO tenders_usage
    FROM public.membership_category_usage
    WHERE user_id = user_uuid
    AND category_slug = 'tenders'
    AND month = current_month;
    
    RETURN jsonb_build_object(
        'has_subscription', true,
        'plan_name', subscription.plan_name,
        'plan_slug', subscription.plan_slug,
        'status', subscription.status,
        'start_date', subscription.start_date,
        'end_date', subscription.end_date,
        'auto_renew', subscription.auto_renew,
        'jobs', jsonb_build_object(
            'can_post', subscription.can_post_jobs,
            'monthly_limit', subscription.jobs_monthly_limit,
            'usage', COALESCE(jobs_usage, 0),
            'remaining', CASE 
                WHEN subscription.jobs_monthly_limit IS NULL THEN NULL
                ELSE subscription.jobs_monthly_limit - COALESCE(jobs_usage, 0)
            END,
            'features', subscription.jobs_features
        ),
        'tenders', jsonb_build_object(
            'can_post', subscription.can_post_tenders,
            'monthly_limit', subscription.tenders_monthly_limit,
            'usage', COALESCE(tenders_usage, 0),
            'remaining', CASE 
                WHEN subscription.tenders_monthly_limit IS NULL THEN NULL
                ELSE subscription.tenders_monthly_limit - COALESCE(tenders_usage, 0)
            END,
            'features', subscription.tenders_features
        ),
        'general', jsonb_build_object(
            'max_listings', subscription.max_listings,
            'max_active_listings', subscription.max_active_listings,
            'features', subscription.general_features
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. UPDATE TRIGGER FOR CATEGORY USAGE
CREATE OR REPLACE FUNCTION increment_membership_category_usage()
RETURNS TRIGGER AS $$
DECLARE
    current_month DATE;
    category TEXT;
    active_subscription_id UUID;
BEGIN
    current_month := DATE_TRUNC('month', NOW())::DATE;
    
    -- Get category slug
    SELECT slug INTO category
    FROM public.categories
    WHERE id = NEW.category_id;
    
    -- Only track for jobs and tenders
    IF category NOT IN ('jobs', 'tenders') THEN
        RETURN NEW;
    END IF;
    
    -- Get active subscription
    SELECT id INTO active_subscription_id
    FROM public.user_subscriptions
    WHERE user_id = NEW.user_id
    AND status = 'active'
    AND (end_date IS NULL OR end_date > NOW())
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Insert or update usage
    INSERT INTO public.membership_category_usage (
        user_id, 
        subscription_id, 
        category_slug, 
        month, 
        posts_count
    )
    VALUES (
        NEW.user_id, 
        active_subscription_id, 
        category, 
        current_month, 
        1
    )
    ON CONFLICT (user_id, category_slug, month)
    DO UPDATE SET 
        posts_count = public.membership_category_usage.posts_count + 1,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS trigger_increment_membership_category_usage ON public.listings;

-- Create new trigger
CREATE TRIGGER trigger_increment_membership_category_usage
    AFTER INSERT ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION increment_membership_category_usage();

-- 8. UPDATE RLS POLICIES FOR LISTINGS
-- Only verified companies and admins can create jobs/tenders

-- Drop existing insert policy
DROP POLICY IF EXISTS "users_insert_listings" ON public.listings;

-- Create new insert policy with verification check
CREATE POLICY "verified_companies_insert_jobs_tenders" ON public.listings
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Allow all categories for regular users
        (category_id NOT IN (
            SELECT id FROM public.categories WHERE slug IN ('jobs', 'tenders')
        ))
        OR
        -- For jobs/tenders, must be admin or verified company
        (
            category_id IN (
                SELECT id FROM public.categories WHERE slug IN ('jobs', 'tenders')
            )
            AND
            (
                -- Is admin
                auth.uid() IN (
                    SELECT id FROM public.profiles 
                    WHERE role IN ('admin', 'super_admin')
                )
                OR
                -- Is verified company
                auth.uid() IN (
                    SELECT id FROM public.profiles 
                    WHERE account_type = 'business' 
                    AND company_verified = true
                )
            )
        )
        AND auth.uid() = user_id
    );

-- 9. VERIFICATION REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.company_verification_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_name TEXT NOT NULL,
    business_license TEXT, -- Document URL
    tin_number TEXT,
    registration_certificate TEXT, -- Document URL
    additional_documents JSONB DEFAULT '[]',
    
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_info')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON public.company_verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_user ON public.company_verification_requests(user_id);

ALTER TABLE public.company_verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_verification" ON public.company_verification_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_create_verification" ON public.company_verification_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins_manage_verifications" ON public.company_verification_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Integrated Membership & Pricing System created successfully!' as message;

-- Show updated membership plans
SELECT 
    name,
    slug,
    price,
    can_post_jobs,
    can_post_tenders,
    jobs_monthly_limit,
    tenders_monthly_limit
FROM public.membership_plans
ORDER BY price;
