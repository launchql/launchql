-- Deploy schemas/inflection/procedures/upper to pg

-- requires: schemas/inflection/schema

BEGIN;

CREATE FUNCTION inflection.upper ( str text ) RETURNS text AS $EOFCODE$
BEGIN
  return upper(str);
END;
$EOFCODE$ LANGUAGE plpgsql STABLE;

COMMIT;
