-- Verify schemas/meta_public/tables/users_module/table on pg

BEGIN;

SELECT verify_table ('meta_public.users_module');

ROLLBACK;
