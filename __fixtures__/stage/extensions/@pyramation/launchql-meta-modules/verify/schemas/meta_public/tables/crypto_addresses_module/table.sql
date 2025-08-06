-- Verify schemas/meta_public/tables/crypto_addresses_module/table on pg

BEGIN;

SELECT verify_table ('meta_public.crypto_addresses_module');

ROLLBACK;
