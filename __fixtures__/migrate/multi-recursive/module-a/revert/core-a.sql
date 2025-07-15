-- Revert module-a:core-a from pg

BEGIN;

DROP SCHEMA IF EXISTS module_a CASCADE;

COMMIT;