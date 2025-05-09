-- Verify schemas/myschema/schema  on pg

BEGIN;

SELECT verify_schema ('myschema');

ROLLBACK;
