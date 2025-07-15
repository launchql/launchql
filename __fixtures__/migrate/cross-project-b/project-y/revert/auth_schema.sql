-- Revert project-y:auth_schema from pg

BEGIN;

DROP SCHEMA IF EXISTS auth CASCADE;

COMMIT;