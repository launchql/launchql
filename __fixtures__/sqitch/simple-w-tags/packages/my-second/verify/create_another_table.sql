-- Verify my-second:create_another_table on pg

BEGIN;

SELECT 1/COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'otherschema' AND table_name = 'user_interactions';

SELECT 1/COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'otherschema' AND table_name = 'consent_agreements';

ROLLBACK;
