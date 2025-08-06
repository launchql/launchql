-- Verify schemas/collections_public/tables/index/table on pg

BEGIN;

SELECT verify_table ('collections_public.index');

ROLLBACK;
