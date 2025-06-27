-- Verify test-project:posts on pg

BEGIN;

SELECT 1 FROM information_schema.tables 
WHERE table_schema = 'app' AND table_name = 'posts';

ROLLBACK;