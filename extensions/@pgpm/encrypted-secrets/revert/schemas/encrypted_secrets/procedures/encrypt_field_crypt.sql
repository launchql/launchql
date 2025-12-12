-- Revert schemas/encrypted_secrets/procedures/encrypt_field_crypt from pg

BEGIN;

DROP FUNCTION encrypted_secrets.encrypt_field_crypt;

COMMIT;
