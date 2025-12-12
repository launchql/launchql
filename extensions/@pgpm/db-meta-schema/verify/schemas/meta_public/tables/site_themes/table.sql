-- Verify schemas/meta_public/tables/site_themes/table on pg

BEGIN;

SELECT verify_table ('meta_public.site_themes');

ROLLBACK;
