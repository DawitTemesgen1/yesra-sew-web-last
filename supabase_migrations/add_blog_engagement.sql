-- ADD BLOG COMMENTS AND LIKES
-- Enhances blog_posts with engagement features

-- ============================================
-- 1. Add count columns to blog_posts
-- ============================================

DO $$ 
BEGIN
    -- Add likes_count if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'likes_count') THEN
        ALTER TABLE blog_posts ADD COLUMN likes_count INTEGER DEFAULT 0;
    END IF;

    -- Add comments_count if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'comments_count') THEN
        ALTER TABLE blog_posts ADD COLUMN comments_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- ============================================
-- 2. Create blog_comments table
-- ============================================

CREATE TABLE IF NOT EXISTS blog_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Null for guest comments
    author_name TEXT, -- For guests or cached user name
    author_email TEXT, -- For guests
    author_avatar TEXT, -- Cached avatar url
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true, -- Auto-approve for now, can change policy later
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. Create blog_likes table
-- ============================================

CREATE TABLE IF NOT EXISTS blog_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id) -- One like per user per post
);

-- ============================================
-- 4. Enable RLS
-- ============================================

ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_likes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. RLS Policies
-- ============================================

-- COMMENTS
-- Public read approved comments
DROP POLICY IF EXISTS "Anyone can view approved comments" ON blog_comments;
CREATE POLICY "Anyone can view approved comments"
    ON blog_comments FOR SELECT
    USING (is_approved = true);

-- Auth users can insert
DROP POLICY IF EXISTS "Authenticated users can comment" ON blog_comments;
CREATE POLICY "Authenticated users can comment"
    ON blog_comments FOR INSERT
    WITH CHECK (auth.role() = 'authenticated'); -- Start with auth only for safety

-- Users can delete their own
DROP POLICY IF EXISTS "Users can delete own comments" ON blog_comments;
CREATE POLICY "Users can delete own comments"
    ON blog_comments FOR DELETE
    USING (auth.uid() = user_id);

-- LIKES
-- Public read
DROP POLICY IF EXISTS "Anyone can view likes" ON blog_likes;
CREATE POLICY "Anyone can view likes"
    ON blog_likes FOR SELECT
    USING (true);

-- Auth users can insert (like)
DROP POLICY IF EXISTS "Authenticated users can like" ON blog_likes;
CREATE POLICY "Authenticated users can like"
    ON blog_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Auth users can delete (unlike)
DROP POLICY IF EXISTS "Users can unlike" ON blog_likes;
CREATE POLICY "Users can unlike"
    ON blog_likes FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 6. Triggers for Counts
-- ============================================

-- Function to update blog_posts.comments_count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE blog_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE blog_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_post_comments_count ON blog_comments;
CREATE TRIGGER trigger_update_post_comments_count
AFTER INSERT OR DELETE ON blog_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Function to update blog_posts.likes_count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE blog_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE blog_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_post_likes_count ON blog_likes;
CREATE TRIGGER trigger_update_post_likes_count
AFTER INSERT OR DELETE ON blog_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- ============================================
-- 7. Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_post_id ON blog_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_user_id ON blog_likes(user_id);

DO $$
BEGIN
    RAISE NOTICE 'Blog Engagement tables (comments, likes) created successfully!';
END $$;
