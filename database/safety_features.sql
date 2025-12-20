-- Safety Features: Reports and Blocked Users
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. CREATE REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('user', 'listing', 'chat')),
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure at least one of reported_user_id or reported_listing_id is set
    CONSTRAINT check_report_target CHECK (
        (reported_user_id IS NOT NULL AND reported_listing_id IS NULL) OR
        (reported_user_id IS NULL AND reported_listing_id IS NOT NULL) OR
        (reported_user_id IS NOT NULL AND reported_listing_id IS NOT NULL)
    )
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_listing ON reports(reported_listing_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- ============================================
-- 2. CREATE BLOCKED USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blocked_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate blocks
    UNIQUE(blocker_id, blocked_id),
    
    -- Prevent self-blocking
    CONSTRAINT check_not_self_block CHECK (blocker_id != blocked_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON blocked_users(blocked_id);

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- Reports Policies
-- Users can create reports
CREATE POLICY "Users can create reports"
    ON reports FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own reports
CREATE POLICY "Users can view their own reports"
    ON reports FOR SELECT
    TO authenticated
    USING (auth.uid() = reporter_id);

-- Admins can view all reports
CREATE POLICY "Admins can view all reports"
    ON reports FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Admins can update reports
CREATE POLICY "Admins can update reports"
    ON reports FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Blocked Users Policies
-- Users can block others
CREATE POLICY "Users can block others"
    ON blocked_users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = blocker_id);

-- Users can view their blocks
CREATE POLICY "Users can view their blocks"
    ON blocked_users FOR SELECT
    TO authenticated
    USING (auth.uid() = blocker_id);

-- Users can unblock
CREATE POLICY "Users can unblock"
    ON blocked_users FOR DELETE
    TO authenticated
    USING (auth.uid() = blocker_id);

-- ============================================
-- 4. HELPER FUNCTIONS
-- ============================================

-- Function to check if user is blocked
CREATE OR REPLACE FUNCTION is_user_blocked(
    p_blocker_id UUID,
    p_blocked_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM blocked_users
        WHERE blocker_id = p_blocker_id
        AND blocked_id = p_blocked_id
    );
END;
$$;

-- Function to get report statistics (for admin)
CREATE OR REPLACE FUNCTION get_report_stats()
RETURNS TABLE (
    total_reports BIGINT,
    pending_reports BIGINT,
    resolved_reports BIGINT,
    dismissed_reports BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_reports,
        COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_reports,
        COUNT(*) FILTER (WHERE status = 'resolved')::BIGINT as resolved_reports,
        COUNT(*) FILTER (WHERE status = 'dismissed')::BIGINT as dismissed_reports
    FROM reports;
END;
$$;

-- ============================================
-- 5. TRIGGERS FOR UPDATED_AT
-- ============================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to reports table
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. GRANT PERMISSIONS
-- ============================================

-- Grant access to authenticated users
GRANT SELECT, INSERT ON reports TO authenticated;
GRANT SELECT, INSERT, DELETE ON blocked_users TO authenticated;

-- Grant update on reports to admins (handled by RLS)
GRANT UPDATE ON reports TO authenticated;

-- ============================================
-- 7. VERIFICATION QUERIES
-- ============================================

-- Verify tables were created
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('reports', 'blocked_users');

-- Verify indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('reports', 'blocked_users')
ORDER BY tablename, indexname;

-- Test the helper function
SELECT * FROM get_report_stats();

COMMENT ON TABLE reports IS 'Stores user reports for listings, users, and chat messages';
COMMENT ON TABLE blocked_users IS 'Stores blocked user relationships';
COMMENT ON FUNCTION is_user_blocked IS 'Check if a user has blocked another user';
COMMENT ON FUNCTION get_report_stats IS 'Get report statistics for admin dashboard';
