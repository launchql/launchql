-- Revert schemas/meta_public/tables/sites/table from pg

BEGIN;

DROP TABLE meta_public.sites;

COMMIT;
