-- Revert schemas/secrets_schema/schema from pg

BEGIN;

DROP SCHEMA secrets_schema;

COMMIT;
