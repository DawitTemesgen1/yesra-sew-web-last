-- Add explicit duration value and unit for easier calculations, while keeping the legacy 'duration' text for display/compatibility
ALTER TABLE public.membership_plans 
ADD COLUMN IF NOT EXISTS duration_value INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS duration_unit TEXT DEFAULT 'months'; -- 'days', 'weeks', 'months', 'years'

-- Reload schema
NOTIFY pgrst, 'reload schema';
