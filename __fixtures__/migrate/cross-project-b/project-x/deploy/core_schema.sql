-- Deploy project-x:core_schema to pg

BEGIN;

CREATE SCHEMA IF NOT EXISTS core;
COMMENT ON SCHEMA core IS 'Core system schema for shared functionality';

COMMIT;