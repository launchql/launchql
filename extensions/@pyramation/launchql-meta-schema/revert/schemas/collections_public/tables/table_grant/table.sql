-- Revert schemas/collections_public/tables/table_grant/table from pg

BEGIN;

DROP TABLE collections_public.table_grant;

COMMIT;
