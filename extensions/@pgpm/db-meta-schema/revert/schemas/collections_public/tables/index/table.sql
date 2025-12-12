-- Revert schemas/collections_public/tables/index/table from pg

BEGIN;

DROP TABLE collections_public.index;

COMMIT;
