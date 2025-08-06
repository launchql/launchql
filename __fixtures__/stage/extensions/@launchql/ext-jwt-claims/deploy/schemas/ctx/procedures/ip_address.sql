-- Deploy schemas/ctx/procedures/ip_address to pg

-- requires: schemas/ctx/schema

BEGIN;

CREATE FUNCTION ctx.ip_address()
  RETURNS inet
AS $$
  SELECT nullif(current_setting('jwt.claims.ip_address', true), '')::inet;
$$
LANGUAGE 'sql' STABLE;

COMMIT;