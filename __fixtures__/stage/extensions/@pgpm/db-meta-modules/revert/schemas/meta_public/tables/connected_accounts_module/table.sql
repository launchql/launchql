-- Revert schemas/meta_public/tables/connected_accounts_module/table from pg

BEGIN;

DROP TABLE meta_public.connected_accounts_module;

COMMIT;
