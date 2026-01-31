
-- Create communications table
CREATE TABLE IF NOT EXISTS public.communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'notification'
    subject TEXT,
    message TEXT,
    recipient TEXT, -- 'All Users', 'Filtered Group', or specific email
    status VARCHAR(50) DEFAULT 'draft', -- 'sent', 'draft', 'failed'
    sent_at TIMESTAMPTZ,
    category VARCHAR(50),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create communication_templates table
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

-- Enable RLS
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_templates ENABLE ROW LEVEL SECURITY;

-- Policies (Admin only access for now, or authenticated for read if needed)
-- Assuming 'admin' role checks or just open for authenticated users for this app context if roles aren't strict yet
-- But usually strictly admin.
CREATE POLICY "Admins can do everything on communications" 
ON public.communications 
FOR ALL 
TO authenticated 
USING ( true ) -- Replace with auth.uid() check if you have admin role logic in JWT
WITH CHECK ( true );

CREATE POLICY "Admins can do everything on templates" 
ON public.communication_templates 
FOR ALL 
TO authenticated 
USING ( true )
WITH CHECK ( true );

-- Insert some default templates
INSERT INTO public.communication_templates (name, subject, content, type, category) VALUES
('Welcome Email', 'Welcome to YesraSew!', '<p>Hi {{name}},</p><p>Welcome to YesraSew, the premier marketplace for tenders, jobs, and assets.</p>', 'email', 'onboarding'),
('Payment Success', 'Payment Received', '<p>Hi {{name}},</p><p>We have received your payment correctly.</p>', 'email', 'transactional'),
('Weekly Digest', 'Your Weekly Opportunities', '<p>Hi {{name}},</p><p>Here are the latest opportunities matching your profile.</p>', 'email', 'newsletter');
