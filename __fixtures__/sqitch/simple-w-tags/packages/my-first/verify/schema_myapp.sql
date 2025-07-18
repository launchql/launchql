-- Verify my-first:schema_myapp on pg

BEGIN;

SELECT 1/COUNT(*) FROM information_schema.schemata WHERE schema_name = 'myapp';

ROLLBACK;
