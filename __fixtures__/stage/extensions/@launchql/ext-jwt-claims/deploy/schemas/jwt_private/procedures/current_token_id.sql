-- Deploy schemas/jwt_private/procedures/current_token_id to pg

-- requires: schemas/jwt_private/schema

BEGIN;

CREATE FUNCTION jwt_private.current_token_id()
  RETURNS uuid
AS $$
  SELECT nullif(current_setting('jwt.claims.token_id', true), '')::uuid;
$$
LANGUAGE 'sql' STABLE;

COMMIT;
