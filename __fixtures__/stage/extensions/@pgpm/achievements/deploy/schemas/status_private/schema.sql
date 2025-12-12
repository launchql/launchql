-- Deploy schemas/status_private/schema to pg


BEGIN;

CREATE SCHEMA IF NOT EXISTS status_private;

GRANT USAGE ON SCHEMA status_private
TO authenticated, anonymous;

ALTER DEFAULT PRIVILEGES IN SCHEMA status_private
GRANT EXECUTE ON FUNCTIONS
TO authenticated;

COMMIT;
