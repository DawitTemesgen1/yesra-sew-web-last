-- Create comments table for listings (replacing reviews)
CREATE TABLE IF NOT EXISTS listing_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_listing_comments_listing ON listing_comments(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_comments_user ON listing_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_listing_comments_created_at ON listing_comments(created_at DESC);

-- RLS Policies
ALTER TABLE listing_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
    ON listing_comments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can add comments"
    ON listing_comments FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own comments"
    ON listing_comments FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
    ON listing_comments FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());
