-- ============================================
-- ADD LAYOUT MANAGEMENT TO TEMPLATE FIELDS
-- Allows admins to control field positioning and display
-- ============================================

-- First, check if width column exists and what type it is
-- If it's INTEGER, we'll keep it and add a new width_type column
-- If it doesn't exist, we'll create it as TEXT

DO $$
BEGIN
    -- Check if width column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'template_fields' 
        AND column_name = 'width'
    ) THEN
        -- Width exists, check if it's INTEGER
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'template_fields' 
            AND column_name = 'width'
            AND data_type = 'integer'
        ) THEN
            -- It's INTEGER, rename it to width_legacy and create new TEXT column
            ALTER TABLE public.template_fields RENAME COLUMN width TO width_legacy;
            ALTER TABLE public.template_fields ADD COLUMN width TEXT DEFAULT 'full' CHECK (width IN ('full', 'half', 'third', 'quarter'));
            
            -- Migrate old integer values to new text values
            UPDATE public.template_fields SET width = CASE
                WHEN width_legacy = 12 THEN 'full'
                WHEN width_legacy = 6 THEN 'half'
                WHEN width_legacy = 4 THEN 'third'
                WHEN width_legacy = 3 THEN 'quarter'
                ELSE 'full'
            END;
            
            -- Drop the legacy column
            ALTER TABLE public.template_fields DROP COLUMN width_legacy;
        END IF;
    ELSE
        -- Width doesn't exist, create it as TEXT
        ALTER TABLE public.template_fields ADD COLUMN width TEXT DEFAULT 'full' CHECK (width IN ('full', 'half', 'third', 'quarter'));
    END IF;
END $$;

-- Add other layout columns
ALTER TABLE public.template_fields 
ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'main' CHECK (section IN ('header', 'main', 'sidebar')),
ADD COLUMN IF NOT EXISTS display_in_card BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS display_in_detail BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS card_priority INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_cover_image BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allow_multiple BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN public.template_fields.section IS 'Layout section for detail page: header (top banner), main (primary content), sidebar (secondary info)';
COMMENT ON COLUMN public.template_fields.width IS 'Field width in responsive grid: full (100%), half (50%), third (33%), quarter (25%)';
COMMENT ON COLUMN public.template_fields.display_in_card IS 'Show this field in listing card preview';
COMMENT ON COLUMN public.template_fields.display_in_detail IS 'Show this field in listing detail page';
COMMENT ON COLUMN public.template_fields.card_priority IS 'Display order in listing card (lower = higher priority)';
COMMENT ON COLUMN public.template_fields.is_cover_image IS 'Use this image as the cover/thumbnail (only for image fields)';
COMMENT ON COLUMN public.template_fields.allow_multiple IS 'Allow multiple values/files for this field';

-- Create index for faster card field queries
CREATE INDEX IF NOT EXISTS idx_template_fields_card ON public.template_fields(display_in_card, card_priority) WHERE display_in_card = true;

-- ============================================
-- ADD DEFAULT IMAGE FIELD TO ALL TEMPLATES
-- ============================================

-- Function to add image field to existing templates
CREATE OR REPLACE FUNCTION add_image_field_to_templates()
RETURNS void AS $func$
DECLARE
  template_rec RECORD;
  first_step_id UUID;
BEGIN
  -- Loop through all active templates
  FOR template_rec IN 
    SELECT id, category_id FROM public.post_templates WHERE is_active = true
  LOOP
    -- Get the first step of this template
    SELECT id INTO first_step_id
    FROM public.template_steps
    WHERE template_id = template_rec.id
    ORDER BY step_number
    LIMIT 1;
    
    -- If template has steps, add image field
    IF first_step_id IS NOT NULL THEN
      -- Check if image field already exists
      IF NOT EXISTS (
        SELECT 1 FROM public.template_fields
        WHERE step_id = first_step_id
        AND field_type = 'image'
        AND field_name = 'images'
      ) THEN
        -- Insert the image field
        INSERT INTO public.template_fields (
          step_id,
          field_name,
          field_label,
          field_type,
          placeholder,
          help_text,
          validation_rules,
          display_order,
          is_required,
          is_visible,
          section,
          width,
          display_in_card,
          display_in_detail,
          card_priority,
          is_cover_image,
          allow_multiple
        ) VALUES (
          first_step_id,
          'images',
          'Images',
          'image',
          'Upload images (first image will be the cover)',
          'Upload up to 10 images. The first image will be used as the cover photo.',
          '{"maxFiles": 10, "maxSize": 10485760, "accept": "image/*"}'::jsonb,
          0,
          true,
          true,
          'header',
          'full',
          true,
          true,
          1,
          true,
          true
        );
      END IF;
    END IF;
  END LOOP;
END;
$func$ LANGUAGE plpgsql;

-- Execute the function to add image fields
SELECT add_image_field_to_templates();

-- Drop the function after use (cleanup)
DROP FUNCTION IF EXISTS add_image_field_to_templates();

-- ============================================
-- SETUP COMPLETE!
-- ============================================
