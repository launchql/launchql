-- Verify schemas/collections_public/tables/foreign_key_constraint/table on pg

BEGIN;

SELECT verify_table ('collections_public.foreign_key_constraint');

ROLLBACK;
