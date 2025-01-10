-- Deploy procedures/myfunction to pg


BEGIN;

CREATE FUNCTION myfunction() returns int as $$
  SELECT 1;
$$
LANGUAGE 'sql' STABLE;

COMMIT;
