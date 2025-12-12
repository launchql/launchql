-- Revert schemas/encrypted_secrets/procedures/secrets_verify from pg

BEGIN;

DROP FUNCTION encrypted_secrets.secrets_verify;

COMMIT;
