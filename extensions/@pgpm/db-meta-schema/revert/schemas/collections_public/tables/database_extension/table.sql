-- Revert schemas/collections_public/tables/database_extension/table from pg

BEGIN;

DROP TABLE collections_public.database_extension;

COMMIT;
