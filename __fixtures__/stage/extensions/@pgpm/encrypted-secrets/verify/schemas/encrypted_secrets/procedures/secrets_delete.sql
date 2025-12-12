-- Verify schemas/encrypted_secrets/procedures/secrets_delete  on pg

BEGIN;

SELECT verify_function ('encrypted_secrets.secrets_delete');

ROLLBACK;
