-- Deploy schemas/inflection/procedures/no_consecutive_caps to pg

-- requires: schemas/inflection/schema

BEGIN;

CREATE FUNCTION inflection.no_consecutive_caps_till_end(
  str text
) returns text as $$
DECLARE
  result text[];
  temp text;
BEGIN
    FOR result IN
    SELECT regexp_matches(str, E'([A-Z])([A-Z]+$)', 'g')
      LOOP
        temp = result[1] || lower(result[2]);
        str = replace(str, result[1] || result[2], temp);
      END LOOP;
  return str;
END;
$$
LANGUAGE 'plpgsql' STABLE;


CREATE FUNCTION inflection.no_consecutive_caps_till_lower(
  str text
) returns text as $$
DECLARE
  result text[];
  temp text;
BEGIN
    FOR result IN
    SELECT regexp_matches(str, E'([A-Z])([A-Z]+)[A-Z][a-z]', 'g')
      LOOP
        temp = result[1] || lower(result[2]);
        str = replace(str, result[1] || result[2], temp);
      END LOOP;

  return str;
END;
$$
LANGUAGE 'plpgsql' STABLE;


CREATE FUNCTION inflection.no_consecutive_caps(
  str text
) returns text as $$
  select inflection.no_consecutive_caps_till_lower(inflection.no_consecutive_caps_till_end(str));
$$
LANGUAGE 'sql' STABLE;

COMMIT;
