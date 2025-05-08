-- Revert schemas/meta_public/tables/encrypted_secrets_module/table from pg

BEGIN;

DROP TABLE meta_public.encrypted_secrets_module;

COMMIT;
