-- Deploy schemas/jwt_private/schema to pg


BEGIN;

CREATE SCHEMA jwt_private;

GRANT USAGE ON SCHEMA jwt_private
TO authenticated, anonymous;

ALTER DEFAULT PRIVILEGES IN SCHEMA jwt_private
GRANT EXECUTE ON FUNCTIONS
TO authenticated;

COMMIT;
