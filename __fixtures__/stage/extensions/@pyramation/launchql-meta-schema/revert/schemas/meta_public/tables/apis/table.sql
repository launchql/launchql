-- Revert schemas/meta_public/tables/apis/table from pg

BEGIN;

DROP TABLE meta_public.apis;

COMMIT;
