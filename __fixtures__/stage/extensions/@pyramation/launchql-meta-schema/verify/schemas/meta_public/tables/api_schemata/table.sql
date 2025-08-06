-- Verify schemas/meta_public/tables/api_schemata/table on pg

BEGIN;

SELECT verify_table ('meta_public.api_schemata');

ROLLBACK;
