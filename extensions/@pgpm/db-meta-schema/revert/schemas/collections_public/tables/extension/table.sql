-- Revert schemas/collections_public/tables/extension/table from pg

BEGIN;

DROP TABLE collections_public.extension;

COMMIT;
