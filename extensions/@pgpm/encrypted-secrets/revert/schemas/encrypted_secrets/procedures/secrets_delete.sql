-- Revert schemas/encrypted_secrets/procedures/secrets_delete from pg

BEGIN;

DROP FUNCTION encrypted_secrets.secrets_delete(uuid, text);
DROP FUNCTION encrypted_secrets.secrets_delete(uuid, text[]);

COMMIT;
