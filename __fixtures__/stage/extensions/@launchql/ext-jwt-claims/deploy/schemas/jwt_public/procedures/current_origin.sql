-- Deploy schemas/jwt_public/procedures/current_origin to pg

-- requires: schemas/jwt_public/schema

BEGIN;

CREATE FUNCTION jwt_public.current_origin()
  RETURNS origin
AS $$
  SELECT nullif(current_setting('jwt.claims.origin', true), '')::origin;
$$
LANGUAGE 'sql' STABLE;

COMMIT;