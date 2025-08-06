-- Revert schemas/collections_public/tables/trigger_function/table from pg

BEGIN;

DROP TABLE collections_public.trigger_function;

COMMIT;
