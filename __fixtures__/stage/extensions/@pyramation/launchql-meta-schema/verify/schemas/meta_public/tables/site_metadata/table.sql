-- Verify schemas/meta_public/tables/site_metadata/table on pg

BEGIN;

SELECT verify_table ('meta_public.site_metadata');

ROLLBACK;
