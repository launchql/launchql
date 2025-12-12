-- Revert schemas/meta_public/tables/apps/table from pg

BEGIN;

DROP TABLE meta_public.apps;

COMMIT;
