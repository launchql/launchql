-- Deploy schemas/inflection/procedures/lower to pg

-- requires: schemas/inflection/schema

BEGIN;

CREATE FUNCTION inflection.lower ( str text ) RETURNS text AS $EOFCODE$
BEGIN
  return lower(str);
END;
$EOFCODE$ LANGUAGE plpgsql STABLE;

COMMIT;
