-- Deploy secrets:procedures/secretfunction to pg


BEGIN;

CREATE FUNCTION secretfunction() returns text as $$
  select * from generate_secret();
$$
LANGUAGE 'sql' STABLE;

COMMIT;
