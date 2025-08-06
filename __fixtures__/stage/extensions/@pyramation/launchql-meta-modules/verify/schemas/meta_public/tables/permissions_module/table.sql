-- Verify schemas/meta_public/tables/permissions_module/table on pg

BEGIN;

SELECT verify_table ('meta_public.permissions_module');

ROLLBACK;
