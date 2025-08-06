-- Verify schemas/collections_public/tables/trigger_function/table on pg

BEGIN;

SELECT verify_table ('collections_public.trigger_function');

ROLLBACK;
