-- Revert schemas/encrypted_secrets/procedures/secrets_table_upsert from pg

BEGIN;

DROP FUNCTION encrypted_secrets.secrets_table_upsert;

COMMIT;
