-- Verify schemas/secrets_schema/schema  on pg

BEGIN;

SELECT verify_schema ('secrets_schema');

ROLLBACK;
