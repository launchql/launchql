-- Deploy schemas/status_public/schema to pg


BEGIN;

CREATE SCHEMA IF NOT EXISTS status_public;

GRANT USAGE ON SCHEMA status_public
TO authenticated, anonymous;

ALTER DEFAULT PRIVILEGES IN SCHEMA status_public
GRANT EXECUTE ON FUNCTIONS
TO authenticated;

COMMIT;
