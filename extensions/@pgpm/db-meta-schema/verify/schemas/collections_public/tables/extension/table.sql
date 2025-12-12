-- Verify schemas/collections_public/tables/extension/table on pg

BEGIN;

SELECT verify_table ('collections_public.extension');

ROLLBACK;
