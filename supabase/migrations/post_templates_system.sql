-- ============================================
-- POST TEMPLATES & CATEGORIES SYSTEM
-- Complete database schema for dynamic post forms
-- ============================================

-- 1. CATEGORIES TABLE (Enhanced)
-- ============================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Icon name or URL
  color TEXT DEFAULT '#1E3A8A', -- Brand color for category
  image_url TEXT, -- Category banner image
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. POST TEMPLATES TABLE
-- ============================================
-- Defines the structure of post forms for each category
CREATE TABLE IF NOT EXISTS public.post_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id) -- One template per category
);

-- 3. TEMPLATE STEPS TABLE
-- ============================================
-- Defines the steps in the post form (can be more than 5)
CREATE TABLE IF NOT EXISTS public.template_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.post_templates(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- Icon for the step
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, step_number)
);

-- 4. TEMPLATE FIELDS TABLE
-- ============================================
-- Defines individual fields within each step
CREATE TABLE IF NOT EXISTS public.template_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID REFERENCES public.template_steps(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL, -- e.g., "title", "price", "location"
  field_label TEXT NOT NULL, -- Display label
  field_type TEXT NOT NULL CHECK (field_type IN (
    'text', 'textarea', 'number', 'email', 'phone', 'url',
    'select', 'multiselect', 'radio', 'checkbox',
    'date', 'time', 'datetime',
    'file', 'image', 'video', 'audio',
    'location', 'map', 'color', 'range'
  )),
  placeholder TEXT,
  help_text TEXT,
  default_value TEXT,
  validation_rules JSONB DEFAULT '{}', -- e.g., {"min": 0, "max": 100, "required": true, "pattern": "regex"}
  options JSONB DEFAULT '[]', -- For select, radio, checkbox fields
  display_order INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  conditional_logic JSONB DEFAULT '{}', -- Show/hide based on other fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LISTINGS TABLE (Enhanced for video support)
-- ============================================
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id);
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS media_urls JSONB DEFAULT '[]'; -- Array of {type: 'image'|'video', url: string}
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS video_urls TEXT[]; -- Array of video URLs
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'; -- Dynamic fields from template
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.post_templates(id);

-- 6. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_post_templates_category ON public.post_templates(category_id);
CREATE INDEX IF NOT EXISTS idx_template_steps_template ON public.template_steps(template_id);
CREATE INDEX IF NOT EXISTS idx_template_steps_number ON public.template_steps(step_number);
CREATE INDEX IF NOT EXISTS idx_template_fields_step ON public.template_fields(step_id);
CREATE INDEX IF NOT EXISTS idx_template_fields_order ON public.template_fields(display_order);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_template ON public.listings(template_id);

-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_fields ENABLE ROW LEVEL SECURITY;

-- Everyone can view categories and templates
CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view templates"
  ON public.post_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view template steps"
  ON public.template_steps FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view template fields"
  ON public.template_fields FOR SELECT
  USING (is_visible = true);

-- Only admins can modify (check role in profiles table)
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admins can manage templates"
  ON public.post_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admins can manage template steps"
  ON public.template_steps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admins can manage template fields"
  ON public.template_fields FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

-- 8. STORAGE BUCKETS FOR MEDIA
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('listing-images', 'listing-images', true),
  ('listing-videos', 'listing-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for listing media
CREATE POLICY "Anyone can view listing images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-images');

CREATE POLICY "Authenticated users can upload listing images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Anyone can view listing videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-videos');

CREATE POLICY "Authenticated users can upload listing videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-videos'
    AND auth.role() = 'authenticated'
  );

-- 9. HELPER FUNCTIONS
-- ============================================

-- Function to get complete template with all steps and fields
CREATE OR REPLACE FUNCTION get_template_structure(p_category_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'template', to_jsonb(t.*),
    'steps', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'step', to_jsonb(s.*),
          'fields', (
            SELECT jsonb_agg(to_jsonb(f.*) ORDER BY f.display_order)
            FROM template_fields f
            WHERE f.step_id = s.id
          )
        ) ORDER BY s.step_number
      )
      FROM template_steps s
      WHERE s.template_id = t.id
    )
  ) INTO result
  FROM post_templates t
  WHERE t.category_id = p_category_id
  AND t.is_active = true;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to validate listing data against template
CREATE OR REPLACE FUNCTION validate_listing_data(
  p_template_id UUID,
  p_data JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  required_fields TEXT[];
  field_name TEXT;
BEGIN
  -- Get all required field names
  SELECT array_agg(field_name)
  INTO required_fields
  FROM template_fields tf
  JOIN template_steps ts ON tf.step_id = ts.id
  WHERE ts.template_id = p_template_id
  AND tf.is_required = true;
  
  -- Check if all required fields are present
  FOREACH field_name IN ARRAY required_fields
  LOOP
    IF NOT (p_data ? field_name) THEN
      RETURN false;
    END IF;
  END LOOP;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- 10. SEED DATA - Default Categories
-- ============================================
INSERT INTO public.categories (name, slug, description, icon, color, display_order) VALUES
  ('Homes', 'homes', 'Houses, apartments, and real estate', 'Home', '#1E3A8A', 1),
  ('Cars', 'cars', 'Vehicles and automotive', 'DirectionsCar', '#FFD700', 2),
  ('Jobs', 'jobs', 'Job listings and career opportunities', 'Work', '#10B981', 3),
  ('Tenders', 'tenders', 'Business tenders and contracts', 'Description', '#8B5CF6', 4),
  ('Electronics', 'electronics', 'Phones, computers, and gadgets', 'Devices', '#F59E0B', 5),
  ('Fashion', 'fashion', 'Clothing, shoes, and accessories', 'Checkroom', '#EC4899', 6)
ON CONFLICT (slug) DO NOTHING;

-- 11. TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_templates_updated_at BEFORE UPDATE ON public.post_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_steps_updated_at BEFORE UPDATE ON public.template_steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_fields_updated_at BEFORE UPDATE ON public.template_fields
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Tables created:
-- ✅ categories (enhanced)
-- ✅ post_templates
-- ✅ template_steps
-- ✅ template_fields
-- ✅ listings (enhanced with video support)
--
-- Features:
-- ✅ Dynamic form builder
-- ✅ Unlimited steps (not limited to 5)
-- ✅ Video upload support
-- ✅ Custom fields per category
-- ✅ Validation rules
-- ✅ Conditional logic
-- ✅ Admin-only management
-- ✅ Storage buckets for media
-- ============================================
