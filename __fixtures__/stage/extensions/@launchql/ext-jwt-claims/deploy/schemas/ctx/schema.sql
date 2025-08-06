-- Deploy schemas/ctx/schema to pg


BEGIN;

CREATE SCHEMA ctx;

GRANT USAGE ON SCHEMA ctx
TO authenticated, anonymous;

ALTER DEFAULT PRIVILEGES IN SCHEMA ctx
GRANT EXECUTE ON FUNCTIONS
TO authenticated;

COMMIT;
