-- Revert project-x:core_schema from pg

BEGIN;

DROP SCHEMA IF EXISTS core CASCADE;

COMMIT;