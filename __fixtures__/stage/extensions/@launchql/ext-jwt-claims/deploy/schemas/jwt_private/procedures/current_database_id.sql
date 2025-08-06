-- Deploy schemas/jwt_private/procedures/current_database_id to pg

-- requires: schemas/jwt_private/schema

BEGIN;

CREATE FUNCTION jwt_private.current_database_id()
  RETURNS uuid
AS $$
  SELECT nullif(current_setting('jwt.claims.database_id', true), '')::uuid;
$$
LANGUAGE 'sql' STABLE;

COMMIT;
