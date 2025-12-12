-- Revert schemas/collections_public/tables/schema/table from pg

BEGIN;

DROP TABLE collections_public.schema;

COMMIT;
