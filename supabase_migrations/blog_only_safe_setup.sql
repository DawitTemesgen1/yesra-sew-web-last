-- ============================================
-- BLOG-ONLY SETUP - SAFE FOR EXISTING SYSTEM
-- This ONLY creates blog-specific resources
-- Will NOT affect your existing:
--   - listings bucket
--   - avatars bucket  
--   - post templates
--   - profiles
--   - or any other existing tables
-- ============================================

-- Enable UUID extension (safe if already exists)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PART 1: Create ONLY Blog Storage Bucket
-- ============================================

-- Create public-assets bucket ONLY for blog images
-- This is separate from your existing 'listings' and 'avatars' buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'public-assets',
    'public-assets',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];

-- ============================================
-- PART 2: Storage RLS Policies for Blog Bucket ONLY
-- ============================================

-- Drop ONLY blog-related storage policies (won't affect your existing ones)
DROP POLICY IF EXISTS "Anyone can view public assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload to public-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update public-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete from public-assets" ON storage.objects;

-- Create policies ONLY for public-assets bucket (won't affect listings/avatars)
CREATE POLICY "Anyone can view public assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'public-assets');

CREATE POLICY "Admins can upload to public-assets"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'public-assets' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Admins can update public-assets"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'public-assets' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Admins can delete from public-assets"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'public-assets' 
    AND auth.role() = 'authenticated'
);

-- ============================================
-- PART 3: Blog Tables ONLY
-- ============================================

-- Drop ONLY blog-related policies
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Anyone can send contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can manage contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can view newsletter subscribers" ON newsletter_subscribers;

-- Add additional_images column if it doesn't exist (safe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' 
        AND column_name = 'additional_images'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN additional_images TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Create blog_posts table (won't affect listings or other tables)
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title JSONB NOT NULL,
    excerpt JSONB NOT NULL,
    content JSONB NOT NULL,
    image TEXT NOT NULL,
    additional_images TEXT[] DEFAULT '{}',
    category TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_role TEXT,
    author_avatar TEXT,
    published_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_time TEXT DEFAULT '5 min read',
    tags TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_messages table (separate from your existing tables)
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create newsletter_subscribers table (separate from your existing tables)
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS ONLY on blog tables
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for blog_posts
CREATE POLICY "Anyone can view published blog posts"
    ON blog_posts FOR SELECT
    USING (status = 'published');

CREATE POLICY "Admins can manage blog posts"
    ON blog_posts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Create RLS policies for contact_messages
CREATE POLICY "Anyone can send contact messages"
    ON contact_messages FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can manage contact messages"
    ON contact_messages FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Create RLS policies for newsletter_subscribers
CREATE POLICY "Anyone can subscribe to newsletter"
    ON newsletter_subscribers FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can view newsletter subscribers"
    ON newsletter_subscribers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- ============================================
-- PART 4: Blog-Specific Triggers
-- ============================================

-- Use existing update_updated_at_column function (already exists in your system)
-- Just create triggers for blog tables

-- Drop existing blog triggers if they exist
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON contact_messages;

-- Create triggers for blog tables
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_messages_updated_at
    BEFORE UPDATE ON contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 5: Blog-Specific Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_date ON blog_posts(published_date);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);

-- ============================================
-- PART 6: Success Message
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'BLOG SETUP COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'NEW Resources Created:';
    RAISE NOTICE '  - Storage Bucket: public-assets';
    RAISE NOTICE '  - Tables: blog_posts, contact_messages, newsletter_subscribers';
    RAISE NOTICE '  - RLS Policies: Blog-specific only';
    RAISE NOTICE '';
    RAISE NOTICE 'EXISTING Resources UNCHANGED:';
    RAISE NOTICE '  ✓ listings bucket (untouched)';
    RAISE NOTICE '  ✓ avatars bucket (untouched)';
    RAISE NOTICE '  ✓ profiles table (untouched)';
    RAISE NOTICE '  ✓ listings table (untouched)';
    RAISE NOTICE '  ✓ categories table (untouched)';
    RAISE NOTICE '  ✓ post_templates (untouched)';
    RAISE NOTICE '  ✓ All other tables (untouched)';
    RAISE NOTICE '';
    RAISE NOTICE 'Storage Buckets Now:';
    RAISE NOTICE '  - listings (for post ads)';
    RAISE NOTICE '  - avatars (for profile pictures)';
    RAISE NOTICE '  - public-assets (for blog images) NEW!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'You can now upload blog images!';
    RAISE NOTICE '========================================';
END $$;
