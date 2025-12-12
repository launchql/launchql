-- Verify schemas/meta_public/tables/secrets_module/table on pg

BEGIN;

SELECT verify_table ('meta_public.secrets_module');

ROLLBACK;
