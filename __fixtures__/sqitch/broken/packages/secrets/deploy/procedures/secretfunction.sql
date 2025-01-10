-- Deploy not_secrets:procedures/secretfunction to pg
-- BROKEN BECAUSE it's not_secrets, see ^^^

BEGIN;

CREATE FUNCTION secretfunction() returns integer as $$
  select 1;
$$
LANGUAGE 'sql' STABLE;

COMMIT;
