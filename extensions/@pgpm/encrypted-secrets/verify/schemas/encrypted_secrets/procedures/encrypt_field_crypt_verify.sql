-- Verify schemas/encrypted_secrets/procedures/encrypt_field_crypt_verify  on pg

BEGIN;

SELECT verify_function ('encrypted_secrets.encrypt_field_crypt_verify');

ROLLBACK;
