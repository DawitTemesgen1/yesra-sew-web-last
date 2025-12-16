-- Drop and recreate everything to ensure clean state
DROP TABLE IF EXISTS public.membership_plans CASCADE;
DROP TABLE IF EXISTS public.user_subscriptions CASCADE;

-- 1. Create membership_plans table (with ALL required columns)
CREATE TABLE public.membership_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE, -- Added slug
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    duration TEXT NOT NULL DEFAULT 'monthly', -- 'monthly', 'quarterly', 'yearly', 'lifetime'
    billing_period TEXT, -- Alias for duration if needed, keeping duration as primary
    features JSONB DEFAULT '[]'::jsonb,
    category_limits JSONB DEFAULT '{}'::jsonb,
    permissions JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    listing_duration_days INTEGER DEFAULT 30,
    color TEXT DEFAULT '#2196F3',
    icon TEXT DEFAULT 'Star',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create user_subscriptions table (with proper foreign keys)
CREATE TABLE public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Explicit relationship
    plan_id UUID REFERENCES public.membership_plans(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active', -- 'active', 'expired', 'cancelled'
    start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    end_date TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT false,
    payment_method TEXT,
    payment_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Enable RLS
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. Policies for membership_plans
CREATE POLICY "Public read access for plans" ON public.membership_plans 
    FOR SELECT USING (true);

CREATE POLICY "Admin full access for plans" ON public.membership_plans 
    FOR ALL USING (auth.role() = 'authenticated'); -- Simplified for dev

-- 5. Policies for user_subscriptions
CREATE POLICY "Users view own subscriptions" ON public.user_subscriptions 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin full access subscriptions" ON public.user_subscriptions 
    FOR ALL USING (auth.role() = 'authenticated'); -- Simplified for dev

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
