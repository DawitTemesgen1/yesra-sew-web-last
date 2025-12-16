-- Add is_premium column to listings table
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_listings_is_premium ON listings(is_premium);

-- Add comment
COMMENT ON COLUMN listings.is_premium IS 'Marks listing as premium content requiring subscription to view';

-- Update existing premium listings (if any were marked in custom_fields)
UPDATE listings 
SET is_premium = true 
WHERE custom_fields->>'is_premium' = 'true';
