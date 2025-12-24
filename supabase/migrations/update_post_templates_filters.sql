-- Add filters column to post_templates table to store managed filter configuration
ALTER TABLE public.post_templates 
ADD COLUMN IF NOT EXISTS filters JSONB DEFAULT '{"enabled": true, "items": []}';
