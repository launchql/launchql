-- Deploy schemas/inflection/procedures/no_single_underscores to pg

-- requires: schemas/inflection/schema

BEGIN;

CREATE FUNCTION inflection.no_single_underscores_in_beginning(
  str text
) returns text as $$
DECLARE
  result text[];
  temp text;
BEGIN
    FOR result IN
    SELECT regexp_matches(str, E'(^[a-z])(_)', 'g')
      LOOP
        str = replace(str, result[1] || result[2], result[1]);
      END LOOP;
  return str;
END;
$$
LANGUAGE 'plpgsql' STABLE;


CREATE FUNCTION inflection.no_single_underscores_at_end(
  str text
) returns text as $$
DECLARE
  result text[];
  temp text;
BEGIN
    FOR result IN
    SELECT regexp_matches(str, E'(_)([a-z]$)', 'g')
      LOOP
        str = replace(str, result[1] || result[2], result[2]);
      END LOOP;

  return str;
END;
$$
LANGUAGE 'plpgsql' STABLE;

CREATE FUNCTION inflection.no_single_underscores_in_middle(
  str text
) returns text as $$
DECLARE
  result text[];
  temp text;
BEGIN
    FOR result IN
    SELECT regexp_matches(str, E'(_)([a-z]_)', 'g')
      LOOP
        str = replace(str, result[1] || result[2], result[2]);
      END LOOP;

  return str;
END;
$$
LANGUAGE 'plpgsql' STABLE;


CREATE FUNCTION inflection.no_single_underscores(
  str text
) returns text as $$
  select 
    inflection.no_single_underscores_in_middle(inflection.no_single_underscores_at_end(inflection.no_single_underscores_in_beginning(str)));
$$
LANGUAGE 'sql' STABLE;

COMMIT;
