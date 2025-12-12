-- Revert schemas/meta_public/tables/crypto_auth_module/table from pg

BEGIN;

DROP TABLE meta_public.crypto_auth_module;

COMMIT;
