-- Verify schemas/meta_public/tables/site_modules/table on pg

BEGIN;

SELECT verify_table ('meta_public.site_modules');

ROLLBACK;
