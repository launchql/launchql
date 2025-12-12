-- Revert schemas/collections_public/tables/procedure/table from pg

BEGIN;

DROP TABLE collections_public.procedure;

COMMIT;
