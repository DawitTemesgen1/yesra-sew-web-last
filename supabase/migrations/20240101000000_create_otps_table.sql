-- Create OTPs table
CREATE TABLE IF NOT EXISTS public.otps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone TEXT NOT NULL,
    otp TEXT NOT NULL,
    purpose TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_otps_phone ON public.otps(phone);

-- RLS Policies (Optional, but good practice)
ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;

-- Only server (service role) can insert/select/update
CREATE POLICY "Service role can do everything on otps"
ON public.otps
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
