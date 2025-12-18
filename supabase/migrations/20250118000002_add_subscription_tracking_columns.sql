-- Add listings_used column to user_subscriptions table
-- This tracks how many listings/posts a user has made under their subscription

-- Add listings_used column (tracks total posts made)
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS listings_used INTEGER DEFAULT 0;

-- Add category_usage column (tracks posts per category as JSONB)
-- Example: {"cars": 3, "homes": 2, "jobs": 1}
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS category_usage JSONB DEFAULT '{}'::jsonb;

-- Add amount_paid column if missing (for payment tracking)
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10, 2) DEFAULT 0;

-- Add transaction_id column for payment reference
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS transaction_id TEXT;

-- Add notes column for admin notes
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Set default values for existing records
UPDATE public.user_subscriptions 
SET 
    listings_used = 0,
    category_usage = '{}'::jsonb,
    amount_paid = 0
WHERE listings_used IS NULL 
   OR category_usage IS NULL 
   OR amount_paid IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.user_subscriptions.listings_used IS 'Total number of listings posted under this subscription';
COMMENT ON COLUMN public.user_subscriptions.category_usage IS 'JSONB object tracking posts per category, e.g., {"cars": 3, "homes": 2}';
COMMENT ON COLUMN public.user_subscriptions.amount_paid IS 'Amount paid for this subscription in the specified currency';
COMMENT ON COLUMN public.user_subscriptions.transaction_id IS 'Payment transaction reference ID';
COMMENT ON COLUMN public.user_subscriptions.notes IS 'Admin notes about this subscription';

-- Create index for faster queries on listings_used
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_listings_used 
ON public.user_subscriptions(listings_used);

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';
