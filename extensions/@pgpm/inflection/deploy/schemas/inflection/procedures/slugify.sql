-- Deploy schemas/inflection/procedures/slugify to pg

-- requires: schemas/inflection/schema

-- https://schinckel.net/2015/12/16/slugify()-for-postgres-(almost)/

BEGIN;
CREATE FUNCTION inflection.slugify (value text, allow_unicode boolean)
  RETURNS text
  AS $$
  WITH normalized AS (
    SELECT
      CASE WHEN allow_unicode THEN
        value
      ELSE
        unaccent (value)
      END AS value
),
remove_chars AS (
  SELECT
    regexp_replace(value, E'[^\\w\\s-]', '', 'gi') AS value
FROM
  normalized
),
lowercase AS (
  SELECT
    lower(value) AS value
FROM
  remove_chars
),
trimmed AS (
  SELECT
    trim(value) AS value
FROM
  lowercase
),
hyphenated AS (
  SELECT
    regexp_replace(value, E'[-\\s]+', '-', 'gi') AS value
FROM
  trimmed
)
SELECT
  value
FROM
  hyphenated;
$$
LANGUAGE SQL
STRICT IMMUTABLE;

-- default false overload
CREATE FUNCTION inflection.slugify (text)
  RETURNS text
  AS 'SELECT inflection.slugify($1, false)'
  LANGUAGE SQL
  IMMUTABLE;


COMMIT;
