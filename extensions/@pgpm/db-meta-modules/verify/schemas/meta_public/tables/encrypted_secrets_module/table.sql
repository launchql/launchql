-- Verify schemas/meta_public/tables/encrypted_secrets_module/table on pg

BEGIN;

SELECT verify_table ('meta_public.encrypted_secrets_module');

ROLLBACK;
