-- ============================================
-- ADD LAYOUT MANAGEMENT TO TEMPLATE FIELDS
-- Allows admins to control field positioning and display
-- ============================================

-- Add layout columns to template_fields
ALTER TABLE public.template_fields 
ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'main' CHECK (section IN ('header', 'main', 'sidebar')),
ADD COLUMN IF NOT EXISTS width TEXT DEFAULT 'full' CHECK (width IN ('full', 'half', 'third', 'quarter')),
ADD COLUMN IF NOT EXISTS display_in_card BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS display_in_detail BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS card_priority INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_cover_image BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allow_multiple BOOLEAN DEFAULT false;

-- Add comment for documentation
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
RETURNS void AS $$
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
          '{"maxFiles": 10, "maxSize": 10485760, "accept": "image/*"}',
          0, -- First field
          true, -- Required
          true, -- Visible
          'header', -- Show in header section
          'full', -- Full width
          true, -- Show in card
          true, -- Show in detail
          1, -- High priority in card
          true, -- Is cover image
          true -- Allow multiple
        );
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to add image fields
SELECT add_image_field_to_templates();

-- Drop the function after use (cleanup)
DROP FUNCTION IF EXISTS add_image_field_to_templates();

-- ============================================
-- SETUP COMPLETE!
-- ============================================
