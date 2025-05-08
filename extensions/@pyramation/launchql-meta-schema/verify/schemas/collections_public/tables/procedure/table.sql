-- Verify schemas/collections_public/tables/procedure/table on pg

BEGIN;

SELECT verify_table ('collections_public.procedure');

ROLLBACK;
