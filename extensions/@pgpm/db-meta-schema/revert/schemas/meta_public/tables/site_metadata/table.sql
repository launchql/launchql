-- Revert schemas/meta_public/tables/site_metadata/table from pg

BEGIN;

DROP TABLE meta_public.site_metadata;

COMMIT;
