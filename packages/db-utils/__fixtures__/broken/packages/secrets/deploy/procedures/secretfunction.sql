-- Deploy not_secrets:procedures/secretfunction to pg

BEGIN;

CREATE FUNCTION secretfunction() returns integer as $$
  select 1;
$$
LANGUAGE 'sql' STABLE;

COMMIT;
