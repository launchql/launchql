-- Verify schemas/encrypted_secrets/procedures/secrets_getter  on pg

BEGIN;

SELECT verify_function ('encrypted_secrets.secrets_getter');

ROLLBACK;
