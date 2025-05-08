-- Deploy schemas/inflection/procedures/pascal to pg
-- requires: schemas/inflection/schema
-- requires: schemas/inflection/procedures/camel

BEGIN;

CREATE FUNCTION inflection.pascal (str text)
  RETURNS text
  AS $$
DECLARE
  result text[];
BEGIN
    str = inflection.camel(str);
  return upper(substring(str FROM 1 FOR 1)) || substring(str FROM 2 FOR length(str));
END;
$$
LANGUAGE 'plpgsql' STABLE;

COMMIT;

