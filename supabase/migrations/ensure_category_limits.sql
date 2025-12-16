-- Ensure all required columns exist to prevent 400 Bad Request errors
ALTER TABLE public.membership_plans
ADD COLUMN IF NOT EXISTS category_limits JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS listing_duration_days INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb;

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';
