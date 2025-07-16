-- Verify my-second:create_schema on pg

BEGIN;

SELECT 1/COUNT(*) FROM information_schema.schemata WHERE schema_name = 'otherschema';

ROLLBACK;
