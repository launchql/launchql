-- Revert schemas/collections_public/tables/trigger/table from pg

BEGIN;

DROP TABLE collections_public.trigger;

COMMIT;
