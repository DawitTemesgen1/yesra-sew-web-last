-- Add restricted field to categories for dynamic category restrictions

-- Add restricted column to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS restricted BOOLEAN DEFAULT false;

-- Update existing restricted categories
UPDATE categories 
SET restricted = true 
WHERE slug IN ('jobs', 'tenders', 'job', 'tender');

-- Add comment for clarity
COMMENT ON COLUMN categories.restricted IS 'If true, only verified companies and admins can post to this category';
