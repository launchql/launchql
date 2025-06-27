-- Verify test-project:schema on pg

BEGIN;

SELECT 1 FROM information_schema.schemata WHERE schema_name = 'app';

ROLLBACK;