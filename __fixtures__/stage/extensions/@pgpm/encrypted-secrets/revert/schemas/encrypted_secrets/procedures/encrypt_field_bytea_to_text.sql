-- Revert schemas/encrypted_secrets/procedures/encrypt_field_bytea_to_text from pg

BEGIN;

DROP FUNCTION encrypted_secrets.encrypt_field_bytea_to_text;

COMMIT;
