-- Revert my-third:create_schema from pg

BEGIN;

DROP SCHEMA mythirdapp CASCADE;

COMMIT;
