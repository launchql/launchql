-- Revert schemas/encrypted_secrets/schema from pg

BEGIN;

DROP SCHEMA encrypted_secrets;

COMMIT;
