-- Revert schemas/encrypted_secrets/procedures/encrypt_field_pgp_getter from pg

BEGIN;

DROP FUNCTION encrypted_secrets.encrypt_field_pgp_getter;

COMMIT;
