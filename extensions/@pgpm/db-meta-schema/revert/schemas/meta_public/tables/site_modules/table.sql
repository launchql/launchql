-- Revert schemas/meta_public/tables/site_modules/table from pg

BEGIN;

DROP TABLE meta_public.site_modules;

COMMIT;
