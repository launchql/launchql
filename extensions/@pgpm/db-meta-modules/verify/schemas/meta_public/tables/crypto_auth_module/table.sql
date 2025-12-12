-- Verify schemas/meta_public/tables/crypto_auth_module/table on pg

BEGIN;

SELECT verify_table ('meta_public.crypto_auth_module');

ROLLBACK;
