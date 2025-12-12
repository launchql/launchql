-- Revert schemas/meta_public/tables/api_modules/table from pg

BEGIN;

DROP TABLE meta_public.api_modules;

COMMIT;
