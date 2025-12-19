-- Add 'type' column to listings table for Rent/Sale filters
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS "type" text;

-- Ensure there are no restrictive constraints on 'type' (allow dynamic values)
ALTER TABLE public.listings 
DROP CONSTRAINT IF EXISTS listings_type_check;

-- Create an index on the type column for faster filtering performance
CREATE INDEX IF NOT EXISTS listings_type_idx ON public.listings ("type");

-- Backfill existing data
-- Set default type to 'sale' for existing Cars and Homes
UPDATE public.listings
SET "type" = 'sale'
WHERE "type" IS NULL 
  AND category_id::text IN (
    SELECT id::text FROM public.categories 
    WHERE slug IN ('cars', 'homes', 'car', 'home')
  );

-- Comment on column
COMMENT ON COLUMN public.listings.type IS 'Type of listing: sale, rent, or other';
