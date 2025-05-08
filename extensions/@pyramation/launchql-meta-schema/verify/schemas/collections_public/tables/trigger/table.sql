-- Verify schemas/collections_public/tables/trigger/table on pg

BEGIN;

SELECT verify_table ('collections_public.trigger');

ROLLBACK;
