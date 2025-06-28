-- Verify test-project:users on pg

BEGIN;

SELECT 1 FROM information_schema.tables 
WHERE table_schema = 'app' AND table_name = 'users';

ROLLBACK;