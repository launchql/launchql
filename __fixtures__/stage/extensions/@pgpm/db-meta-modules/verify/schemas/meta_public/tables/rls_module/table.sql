-- Verify schemas/meta_public/tables/rls_module/table on pg

BEGIN;

SELECT verify_table ('meta_public.rls_module');

ROLLBACK;
