-- Verify my-third:create_schema on pg

BEGIN;

SELECT 1/COUNT(*) FROM information_schema.schemata WHERE schema_name = 'metaschema';

ROLLBACK;
