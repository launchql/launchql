-- Verify schemas/encrypted_secrets/procedures/encrypt_field_pgp_getter  on pg

BEGIN;

SELECT verify_function ('encrypted_secrets.encrypt_field_pgp_getter');

ROLLBACK;
