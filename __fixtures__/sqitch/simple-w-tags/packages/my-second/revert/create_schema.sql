-- Revert my-second:create_schema from pg

BEGIN;

DROP SCHEMA mysecondapp CASCADE;

COMMIT;
