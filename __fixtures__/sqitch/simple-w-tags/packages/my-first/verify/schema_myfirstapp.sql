-- Verify my-first:schema_myfirstapp on pg

BEGIN;

SELECT 1/COUNT(*) FROM information_schema.schemata WHERE schema_name = 'myfirstapp';

ROLLBACK;
