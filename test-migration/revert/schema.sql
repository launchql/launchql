-- Revert test-project:schema from pg

BEGIN;

DROP SCHEMA IF EXISTS app CASCADE;

COMMIT;