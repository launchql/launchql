-- Verify my-second:create_table on pg

BEGIN;

SELECT 1/COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'mysecondapp' AND table_name = 'users';

ROLLBACK;
