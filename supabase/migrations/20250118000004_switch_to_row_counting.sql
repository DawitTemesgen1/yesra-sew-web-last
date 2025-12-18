-- SWITCH TO ROW-BASED COUNTING (More Robust)

-- 1. Create table to track Views
CREATE TABLE IF NOT EXISTS public.user_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    category_slug TEXT NOT NULL, -- "jobs", "tenders"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Prevent duplicate views counting (Unique view per listing per user)
    UNIQUE(user_id, listing_id)
);

-- Index for counting
CREATE INDEX IF NOT EXISTS idx_user_views_counting 
ON public.user_views(user_id, category_slug);

-- 2. Drop the complex RPC functions (we will use simple SQL counts now)
DROP FUNCTION IF EXISTS public.increment_post_usage;
DROP FUNCTION IF EXISTS public.increment_view_usage;

-- 3. Create simple secure function to record a view
CREATE OR REPLACE FUNCTION public.record_listing_view(
    p_listing_id UUID,
    p_category_slug TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN false;
    END IF;

    -- Insert safely, ignoring duplicates
    INSERT INTO public.user_views (user_id, listing_id, category_slug)
    VALUES (v_user_id, p_listing_id, p_category_slug)
    ON CONFLICT (user_id, listing_id) DO NOTHING;

    RETURN true;
END;
$$;

-- Helper to get usage stats in one call
CREATE OR REPLACE FUNCTION public.get_user_subscription_stats(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_post_counts JSONB;
    v_view_counts JSONB;
BEGIN
    -- Count Posts per category (Active/Approved/Pending - i.e. "Used" slots)
    -- We generally count anything that isn't 'archived' or 'deleted' as using a slot?
    -- Or just 'active'? Usually any post checks against limit.
    -- Count Posts per category (Active/Approved/Pending)
    -- Hybrid Approach: Handles both UUID (New) and '1','2' (Legacy) IDs
    SELECT jsonb_object_agg(final_slug, total_count)
    INTO v_post_counts
    FROM (
        SELECT slug as final_slug, sum(cnt) as total_count
        FROM (
            -- 1. UUID Matches (New System - PostAdPage uses this)
            SELECT c.slug, count(*) as cnt
            FROM public.listings l
            JOIN public.categories c ON l.category_id::text = c.id::text
            WHERE l.user_id = p_user_id 
            AND l.status NOT IN ('deleted', 'archived', 'rejected')
            GROUP BY c.slug

            UNION ALL

            -- 2. Legacy Matches (Old System - Seed data etc)
            SELECT 
                CASE 
                    WHEN category_id = '1' THEN 'homes'
                    WHEN category_id = '2' THEN 'cars'
                    WHEN category_id = '3' THEN 'jobs'
                    WHEN category_id = '4' THEN 'tenders'
                    ELSE 'other'
                END as slug,
                count(*) as cnt
            FROM public.listings l
            WHERE l.user_id = p_user_id 
            AND l.status NOT IN ('deleted', 'archived', 'rejected')
            AND category_id IN ('1', '2', '3', '4') -- Only legacy IDs
            GROUP BY 1
        ) combined
        GROUP BY 1
    ) results;

    -- Count Views per category
    SELECT jsonb_object_agg(category_slug, count)
    INTO v_view_counts
    FROM (
        SELECT category_slug, count(*) 
        FROM public.user_views 
        WHERE user_id = p_user_id 
        GROUP BY category_slug
    ) t;

    RETURN jsonb_build_object(
        'post_usage', COALESCE(v_post_counts, '{}'::jsonb),
        'view_usage', COALESCE(v_view_counts, '{}'::jsonb)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_subscription_stats(UUID) TO authenticated;
