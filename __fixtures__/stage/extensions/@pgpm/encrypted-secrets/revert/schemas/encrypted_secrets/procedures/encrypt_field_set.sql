-- Revert schemas/encrypted_secrets/procedures/encrypt_field_set from pg

BEGIN;

DROP FUNCTION encrypted_secrets.encrypt_field_set;

COMMIT;
