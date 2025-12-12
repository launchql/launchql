-- Verify schemas/meta_public/tables/user_auth_module/table on pg

BEGIN;

SELECT verify_table ('meta_public.user_auth_module');

ROLLBACK;
