-- Deploy schemas/ctx/procedures/origin to pg

-- requires: schemas/ctx/schema

BEGIN;

CREATE FUNCTION ctx.origin()
  RETURNS origin
AS $$
  SELECT nullif(current_setting('jwt.claims.origin', true), '')::origin;
$$
LANGUAGE 'sql' STABLE;

COMMIT;