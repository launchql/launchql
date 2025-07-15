-- Revert project-z:app_schema from pg

BEGIN;

DROP SCHEMA IF EXISTS app CASCADE;

COMMIT;