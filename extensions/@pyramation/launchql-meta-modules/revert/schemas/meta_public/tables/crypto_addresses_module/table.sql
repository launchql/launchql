-- Revert schemas/meta_public/tables/crypto_addresses_module/table from pg

BEGIN;

DROP TABLE meta_public.crypto_addresses_module;

COMMIT;
