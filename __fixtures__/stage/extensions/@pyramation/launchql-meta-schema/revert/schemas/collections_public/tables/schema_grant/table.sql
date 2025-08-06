-- Revert schemas/collections_public/tables/schema_grant/table from pg

BEGIN;

DROP TABLE collections_public.schema_grant;

COMMIT;
