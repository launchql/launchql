-- Revert my-first:schema_myapp from pg

BEGIN;

DROP SCHEMA myapp CASCADE;

COMMIT;
