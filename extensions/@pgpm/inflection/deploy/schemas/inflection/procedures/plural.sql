-- Deploy schemas/inflection/procedures/plural to pg

-- requires: schemas/inflection/schema
-- requires: schemas/inflection/tables/inflection_rules/table

BEGIN;

CREATE FUNCTION inflection.plural (str text)
  RETURNS text
  AS $$
DECLARE
  result record;
  matches text[];
BEGIN
    FOR result IN
    SELECT * FROM inflection.inflection_rules where type='plural'
      LOOP
        matches = regexp_matches(str, result.test, 'gi');
        IF (array_length(matches, 1) > 0) THEN
           IF (result.replacement IS NULL) THEN
				return str;        
           END IF;
           str = regexp_replace(str, result.test, result.replacement, 'gi');
           return str;
        END IF;
      END LOOP;
  return str;
END;
$$
LANGUAGE 'plpgsql' IMMUTABLE;
COMMIT;
