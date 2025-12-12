-- Verify schemas/collections_public/tables/unique_constraint/table on pg

BEGIN;

SELECT verify_table ('collections_public.unique_constraint');

ROLLBACK;
