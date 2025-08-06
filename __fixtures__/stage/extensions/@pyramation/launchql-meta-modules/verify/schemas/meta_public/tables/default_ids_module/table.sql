-- Verify schemas/meta_public/tables/default_ids_module/table on pg

BEGIN;

SELECT verify_table ('meta_public.default_ids_module');

ROLLBACK;
