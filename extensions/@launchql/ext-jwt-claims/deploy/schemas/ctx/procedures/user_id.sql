-- Deploy schemas/ctx/procedures/user_id to pg

-- requires: schemas/ctx/schema

BEGIN;

CREATE FUNCTION ctx.user_id()
  RETURNS uuid
AS $$
  SELECT nullif(current_setting('jwt.claims.user_id', true), '')::uuid;
$$
LANGUAGE 'sql' STABLE;

COMMIT;