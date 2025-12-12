-- Verify schemas/encrypted_secrets/schema  on pg

BEGIN;

SELECT verify_schema ('encrypted_secrets');

ROLLBACK;
