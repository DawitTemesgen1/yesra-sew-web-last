-- CHECK FOR ADMIN TABLES
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('system_settings', 'transactions', 'analytics', 'page_views', 'reports');
