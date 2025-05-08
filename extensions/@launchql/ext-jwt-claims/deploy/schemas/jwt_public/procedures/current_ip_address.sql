-- Deploy schemas/jwt_public/procedures/current_ip_address to pg

-- requires: schemas/jwt_public/schema

BEGIN;

CREATE FUNCTION jwt_public.current_ip_address()
  RETURNS inet
AS $$
  SELECT nullif(current_setting('jwt.claims.ip_address', true), '')::inet;
$$
LANGUAGE 'sql' STABLE;

COMMIT;