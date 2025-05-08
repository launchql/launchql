-- Verify schemas/collections_public/tables/table_grant/table on pg

BEGIN;

SELECT verify_table ('collections_public.table_grant');

ROLLBACK;
