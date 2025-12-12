-- Verify schemas/encrypted_secrets/procedures/secrets_upsert  on pg

BEGIN;

SELECT verify_function ('encrypted_secrets.secrets_upsert');

ROLLBACK;
