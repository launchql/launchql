-- Verify my-third:create_table on pg

BEGIN;

SELECT 1/COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'mythirdapp' AND table_name = 'customers';

ROLLBACK;
