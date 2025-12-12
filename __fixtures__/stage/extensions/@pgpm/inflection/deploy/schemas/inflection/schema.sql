-- Deploy schemas/inflection/schema to pg


BEGIN;

CREATE SCHEMA inflection;

GRANT USAGE ON SCHEMA inflection
TO public;

ALTER DEFAULT PRIVILEGES IN SCHEMA inflection
GRANT EXECUTE ON FUNCTIONS
TO public;

COMMIT;
