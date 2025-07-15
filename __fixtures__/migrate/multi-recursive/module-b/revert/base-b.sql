-- Revert module-b:base-b from pg

BEGIN;

DROP SCHEMA IF EXISTS module_b CASCADE;

COMMIT;