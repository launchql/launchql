-- Deploy schemas/inflection/procedures/camel to pg

-- requires: schemas/inflection/schema
-- requires: schemas/inflection/procedures/underscore

BEGIN;

CREATE FUNCTION inflection.camel (str text)
  RETURNS text
  AS $$
DECLARE
  result text[];
BEGIN
    str = inflection.underscore(str);
    FOR result IN
    SELECT regexp_matches(str,  E'(_[a-zA-Z0-9])', 'g')
      LOOP
        str = replace(str, result[1], upper(result[1]));
      END LOOP;
  return regexp_replace(substring(str FROM 1 FOR 1) || substring(str FROM 2 FOR length(str)), E'[_]+', '', 'gi');
END;
$$
LANGUAGE 'plpgsql' STABLE;

COMMIT;
