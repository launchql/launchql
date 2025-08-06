-- Verify schemas/collections_public/tables/schema/table on pg

BEGIN;

SELECT verify_table ('collections_public.schema');

ROLLBACK;
