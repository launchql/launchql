-- Verify my-first:table_users on pg

BEGIN;

SELECT 1/COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'myfirstapp' AND table_name = 'users';

ROLLBACK;
