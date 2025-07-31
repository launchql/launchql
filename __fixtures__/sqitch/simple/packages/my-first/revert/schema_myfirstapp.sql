-- Revert my-first:schema_myfirstapp from pg

BEGIN;

DROP SCHEMA myfirstapp CASCADE;

COMMIT;
