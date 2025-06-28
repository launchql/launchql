-- Verify test-simple:index on pg

SELECT 1/COUNT(*) FROM pg_indexes 
WHERE schemaname = 'test_app' 
AND tablename = 'users' 
AND indexname IN ('idx_users_email', 'idx_users_created_at')
HAVING COUNT(*) = 2;