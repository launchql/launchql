-- Verify schemas/collections_public/tables/primary_key_constraint/table on pg

BEGIN;

SELECT verify_table ('collections_public.primary_key_constraint');

ROLLBACK;
