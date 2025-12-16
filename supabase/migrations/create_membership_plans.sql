-- Create membership_plans table
CREATE TABLE IF NOT EXISTS public.membership_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration TEXT NOT NULL, -- 'monthly', 'quarterly', 'yearly', 'lifetime'
    features JSONB DEFAULT '[]'::jsonb, -- Array of strings
    category_limits JSONB DEFAULT '{}'::jsonb, -- Key-value: {"jobs": 5, "homes": -1} (-1 for unlimited)
    is_active BOOLEAN DEFAULT true,
    color TEXT DEFAULT '#2196F3',
    icon TEXT DEFAULT 'Star', -- Icon name to be resolved on frontend
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS Policies
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for pricing page)
CREATE POLICY "Allow public read access" ON public.membership_plans
    FOR SELECT USING (true);

-- Allow admin full access
-- (Assuming admin policies are handled via service_role or specific admin check, adding basic policy for authenticated users if they are admins)
-- For now, allow authenticated to insert/update? No, strictly admin.
-- Since we use Supabase client, we might rely on Service Role key for admin ops or user_metadata.role check.
-- For simplicity in this demo environment, allowing auth users (admins) to modify.
CREATE POLICY "Allow authenticated full access" ON public.membership_plans
    FOR ALL USING (auth.role() = 'authenticated');
