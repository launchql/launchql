-- Deploy schemas/jwt_public/schema to pg


BEGIN;

CREATE SCHEMA jwt_public;

GRANT USAGE ON SCHEMA jwt_public
TO authenticated, anonymous;

ALTER DEFAULT PRIVILEGES IN SCHEMA jwt_public
GRANT EXECUTE ON FUNCTIONS
TO authenticated;

COMMIT;
