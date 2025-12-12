-- Deploy schemas/stamps/schema to pg


BEGIN;

CREATE SCHEMA stamps;

GRANT USAGE ON SCHEMA stamps
TO authenticated, anonymous;

ALTER DEFAULT PRIVILEGES IN SCHEMA stamps
GRANT EXECUTE ON FUNCTIONS
TO authenticated;

COMMIT;
