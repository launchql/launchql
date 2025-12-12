-- Verify schemas/encrypted_secrets/procedures/secrets_verify  on pg

BEGIN;

SELECT verify_function ('encrypted_secrets.secrets_verify');

ROLLBACK;
