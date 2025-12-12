-- Verify schemas/collections_public/tables/check_constraint/table on pg

BEGIN;

SELECT verify_table ('collections_public.check_constraint');

ROLLBACK;
