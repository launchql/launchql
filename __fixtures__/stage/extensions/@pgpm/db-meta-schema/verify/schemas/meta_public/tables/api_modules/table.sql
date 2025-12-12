-- Verify schemas/meta_public/tables/api_modules/table on pg

BEGIN;

SELECT verify_table ('meta_public.api_modules');

ROLLBACK;
