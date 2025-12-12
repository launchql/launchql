-- Verify schemas/meta_public/tables/limits_module/table on pg

BEGIN;

SELECT verify_table ('meta_public.limits_module');

ROLLBACK;
