
-- Create communications table (if not exists)
CREATE TABLE IF NOT EXISTS public.communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    subject TEXT,
    message TEXT,
    recipient TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    sent_at TIMESTAMPTZ,
    category VARCHAR(50),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: The user might have a partial table created without the 'content' column if a previous run failed.
-- Let's make sure the table exists correctly.
CREATE TABLE IF NOT EXISTS public.communication_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subject TEXT,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'email',
    category VARCHAR(50) DEFAULT 'general',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Force add columns if they are missing (idempotent fix)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'communication_templates' AND column_name = 'content') THEN
        ALTER TABLE public.communication_templates ADD COLUMN content TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'communication_templates' AND column_name = 'subject') THEN
        ALTER TABLE public.communication_templates ADD COLUMN subject TEXT;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts before recreating
DROP POLICY IF EXISTS "Admins can do everything on communications" ON public.communications;
DROP POLICY IF EXISTS "Admins can do everything on templates" ON public.communication_templates;

-- Recreate Policies
CREATE POLICY "Admins can do everything on communications" 
ON public.communications FOR ALL TO authenticated 
USING ( true ) WITH CHECK ( true );

CREATE POLICY "Admins can do everything on templates" 
ON public.communication_templates FOR ALL TO authenticated 
USING ( true ) WITH CHECK ( true );

-- Insert default templates (using ON CONFLICT DO NOTHING to avoid duplicates)
-- Note: 'name' is not unique by default, so we just check lightly or rely on IDs.
-- Since we can't easily upsert without a unique constraint, we just insert.
-- Users can delete duplicates if they run this multiple times.
INSERT INTO public.communication_templates (name, subject, content, type, category) 
SELECT 'Welcome Email', 'Welcome to YesraSew!', '<p>Hi {{name}},</p><p>Welcome to YesraSew, the premier marketplace for tenders, jobs, and assets.</p>', 'email', 'onboarding'
WHERE NOT EXISTS (
    SELECT 1 FROM public.communication_templates WHERE name = 'Welcome Email'
);

INSERT INTO public.communication_templates (name, subject, content, type, category) 
SELECT 'Payment Success', 'Payment Received', '<p>Hi {{name}},</p><p>We have received your payment correctly.</p>', 'email', 'transactional'
WHERE NOT EXISTS (
    SELECT 1 FROM public.communication_templates WHERE name = 'Payment Success'
);

INSERT INTO public.communication_templates (name, subject, content, type, category) 
SELECT 'Weekly Digest', 'Your Weekly Opportunities', '<p>Hi {{name}},</p><p>Here are the latest opportunities matching your profile.</p>', 'email', 'newsletter'
WHERE NOT EXISTS (
    SELECT 1 FROM public.communication_templates WHERE name = 'Weekly Digest'
);
