-- Function to calculate total revenue from completed transactions
CREATE OR REPLACE FUNCTION public.get_total_revenue()
RETURNS NUMERIC AS $$
DECLARE
    total NUMERIC;
BEGIN
    SELECT COALESCE(SUM(amount), 0)
    INTO total
    FROM public.payment_transactions
    WHERE status = 'completed';
    
    RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get listing counts by category
CREATE OR REPLACE FUNCTION public.get_category_counts()
RETURNS TABLE (category_id TEXT, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT category, COUNT(*) as count
    FROM public.listings
    WHERE status IN ('active', 'approved')
    GROUP BY category;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
