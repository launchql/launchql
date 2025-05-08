-- Verify schemas/collections_public/tables/schema_grant/table on pg

BEGIN;

SELECT verify_table ('collections_public.schema_grant');

ROLLBACK;
