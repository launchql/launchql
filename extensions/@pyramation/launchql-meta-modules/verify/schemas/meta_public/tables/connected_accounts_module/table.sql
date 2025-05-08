-- Verify schemas/meta_public/tables/connected_accounts_module/table on pg

BEGIN;

SELECT verify_table ('meta_public.connected_accounts_module');

ROLLBACK;
