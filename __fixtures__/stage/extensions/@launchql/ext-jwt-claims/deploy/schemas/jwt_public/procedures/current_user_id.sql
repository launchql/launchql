-- Deploy schemas/jwt_public/procedures/current_user_id to pg

-- requires: schemas/jwt_public/schema

BEGIN;

CREATE FUNCTION jwt_public.current_user_id()
  RETURNS uuid
AS $$
  SELECT nullif(current_setting('jwt.claims.user_id', true), '')::uuid;
$$
LANGUAGE 'sql' STABLE;

COMMIT;
