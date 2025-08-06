-- Deploy schemas/uuids/schema to pg

-- requires: extension/defaults

BEGIN;

CREATE SCHEMA uuids;

GRANT USAGE ON SCHEMA uuids
TO public;

ALTER DEFAULT PRIVILEGES
IN SCHEMA uuids
GRANT EXECUTE ON FUNCTIONS
TO public;

COMMIT;
