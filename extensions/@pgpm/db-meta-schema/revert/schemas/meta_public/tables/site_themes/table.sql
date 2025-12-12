-- Revert schemas/meta_public/tables/site_themes/table from pg

BEGIN;

DROP TABLE meta_public.site_themes;

COMMIT;
