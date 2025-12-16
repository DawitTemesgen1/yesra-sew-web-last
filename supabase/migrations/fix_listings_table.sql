-- ============================================
-- FIX LISTINGS TABLE FOR DYNAMIC TEMPLATES
-- Remove old constraints and update for new system
-- ============================================

-- 1. Drop old check constraints that might conflict
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_category_id_check;
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_type_check;
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_status_check;

-- 2. Ensure all necessary columns exist
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id);
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.post_templates(id);
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS media_urls JSONB DEFAULT '[]';
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS video_urls TEXT[];
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- 3. Update existing listings to have valid status values
UPDATE public.listings 
SET status = 'pending' 
WHERE status IS NULL OR status NOT IN ('pending', 'active', 'sold', 'expired', 'rejected', 'draft');

-- 4. Make title nullable or ensure it has a default
ALTER TABLE public.listings ALTER COLUMN title DROP NOT NULL;
ALTER TABLE public.listings ALTER COLUMN title SET DEFAULT 'Untitled Listing';

-- 5. Make description nullable
ALTER TABLE public.listings ALTER COLUMN description DROP NOT NULL;

-- 6. Make price nullable and default to 0
ALTER TABLE public.listings ALTER COLUMN price DROP NOT NULL;
ALTER TABLE public.listings ALTER COLUMN price SET DEFAULT 0;

-- 7. NOW add the status check constraint (after updating existing data)
ALTER TABLE public.listings ADD CONSTRAINT listings_status_check 
  CHECK (status IN ('pending', 'active', 'sold', 'expired', 'rejected', 'draft'));

-- 7. Update RLS policies for listings
DROP POLICY IF EXISTS "Authenticated users can insert listings" ON public.listings;
DROP POLICY IF EXISTS "Users can update own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON public.listings;
DROP POLICY IF EXISTS "Anyone can view listings" ON public.listings;
DROP POLICY IF EXISTS "Users can view own listings" ON public.listings;
DROP POLICY IF EXISTS "Admins can manage all listings" ON public.listings;
DROP POLICY IF EXISTS "Anyone can view active listings" ON public.listings;

-- Enable RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Anyone can view active listings
CREATE POLICY "Anyone can view active listings"
  ON public.listings FOR SELECT
  USING (status = 'active' OR status = 'pending');

-- Users can view their own listings regardless of status
CREATE POLICY "Users can view own listings"
  ON public.listings FOR SELECT
  USING (auth.uid() = user_id);

-- Authenticated users can insert listings
CREATE POLICY "Authenticated users can insert listings"
  ON public.listings FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' 
    AND auth.uid() = user_id
  );

-- Users can update their own listings
CREATE POLICY "Users can update own listings"
  ON public.listings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own listings
CREATE POLICY "Users can delete own listings"
  ON public.listings FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY "Admins can manage all listings"
  ON public.listings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON public.listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_category_template ON public.listings(category_id, template_id);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);

-- 9. Add updated_at trigger if not exists
CREATE OR REPLACE FUNCTION update_listings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_listings_updated_at_trigger ON public.listings;
CREATE TRIGGER update_listings_updated_at_trigger
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION update_listings_updated_at();

-- ============================================
-- VERIFICATION QUERIES (Optional - comment out if not needed)
-- ============================================

-- Check the listings table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'listings'
-- ORDER BY ordinal_position;

-- Check constraints
-- SELECT conname, contype, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'public.listings'::regclass;

-- Check RLS policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'listings';
