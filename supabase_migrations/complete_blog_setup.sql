-- COMPLETE BLOG SETUP WITH STORAGE
-- Run this to set up everything including image upload

-- ============================================
-- PART 1: Create Storage Bucket
-- ============================================

-- Create public-assets bucket if it doesn't exist
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
-- PART 2: Storage RLS Policies
-- ============================================

-- Drop existing storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view public assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload to public-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete from public-assets" ON storage.objects;

-- Allow anyone to view files in public-assets bucket
CREATE POLICY "Anyone can view public assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'public-assets');

-- Allow authenticated users (admins) to upload
CREATE POLICY "Admins can upload to public-assets"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'public-assets' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their uploads
CREATE POLICY "Admins can update public-assets"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'public-assets' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete
CREATE POLICY "Admins can delete from public-assets"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'public-assets' 
    AND auth.role() = 'authenticated'
);

-- ============================================
-- PART 3: Blog Tables
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Anyone can send contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can manage contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can view newsletter subscribers" ON newsletter_subscribers;

-- Add additional_images column if it doesn't exist
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

-- Create blog_posts table
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

-- Create contact_messages table
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

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
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
            AND profiles.role = 'admin'
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
            AND profiles.role = 'admin'
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
            AND profiles.role = 'admin'
        )
    );

-- ============================================
-- PART 4: Triggers and Functions
-- ============================================

-- Create or replace update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON contact_messages;

-- Create triggers
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_messages_updated_at
    BEFORE UPDATE ON contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 5: Indexes
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
    RAISE NOTICE 'Storage Bucket: public-assets (created)';
    RAISE NOTICE 'Storage Policies: Set up for image uploads';
    RAISE NOTICE 'Tables: blog_posts, contact_messages, newsletter_subscribers';
    RAISE NOTICE 'RLS Policies: Configured';
    RAISE NOTICE 'Triggers: Created';
    RAISE NOTICE 'Indexes: Created';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'You can now upload images!';
    RAISE NOTICE 'Test by creating a blog post in admin panel';
    RAISE NOTICE '========================================';
END $$;
