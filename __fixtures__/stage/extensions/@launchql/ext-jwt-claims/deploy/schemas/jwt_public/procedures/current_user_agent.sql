-- Deploy schemas/jwt_public/procedures/current_user_agent to pg

-- requires: schemas/jwt_public/schema

BEGIN;

CREATE FUNCTION jwt_public.current_user_agent()
  RETURNS text
AS $$
  SELECT nullif(current_setting('jwt.claims.user_agent', true), '');
$$
LANGUAGE 'sql' STABLE;

COMMIT;