-- Revert project-a:base_schema from pg

BEGIN;

DROP SCHEMA base CASCADE;

COMMIT;