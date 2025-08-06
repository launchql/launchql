-- Verify schemas/meta_public/tables/api_extensions/table on pg

BEGIN;

SELECT verify_table ('meta_public.api_extensions');

ROLLBACK;
