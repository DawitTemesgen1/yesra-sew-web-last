-- Add FAQ table to existing blog migration
-- Run this AFTER the main blog migration

-- Create faqs table
CREATE TABLE IF NOT EXISTS faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question JSONB NOT NULL, -- {en: "", am: "", om: "", ti: ""}
    answer JSONB NOT NULL,
    category TEXT NOT NULL, -- 'account', 'posting', 'payment', 'technical'
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_active ON faqs(is_active);
CREATE INDEX IF NOT EXISTS idx_faqs_order ON faqs(display_order);

-- Enable RLS
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active FAQs
CREATE POLICY "Anyone can view active FAQs"
    ON faqs FOR SELECT
    USING (is_active = true);

-- Policy: Only admins can manage FAQs
CREATE POLICY "Admins can manage FAQs"
    ON faqs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER update_faqs_updated_at
    BEFORE UPDATE ON faqs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE faqs IS 'Frequently Asked Questions with multi-language support';
