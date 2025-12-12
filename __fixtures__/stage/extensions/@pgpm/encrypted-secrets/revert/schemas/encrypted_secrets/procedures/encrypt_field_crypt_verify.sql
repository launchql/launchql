-- Revert schemas/encrypted_secrets/procedures/encrypt_field_crypt_verify from pg

BEGIN;

DROP FUNCTION encrypted_secrets.encrypt_field_crypt_verify;

COMMIT;
