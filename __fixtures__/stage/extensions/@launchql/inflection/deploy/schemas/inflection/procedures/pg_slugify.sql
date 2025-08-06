-- Deploy schemas/inflection/procedures/pg_slugify to pg
-- requires: schemas/inflection/schema
-- requires: schemas/inflection/procedures/no_consecutive_caps
-- NOTE: this does NOT lowercase, and uses underscores instead of dashes

BEGIN;
CREATE FUNCTION inflection.pg_slugify (value text, allow_unicode boolean)
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
no_consecutive_caps AS (
  SELECT
    inflection.no_consecutive_caps (value) AS value
FROM
  normalized
),
remove_chars AS (
  SELECT
    regexp_replace(value, E'[^\\w\\s-]', '', 'gi') AS value
FROM
  no_consecutive_caps
),
trimmed AS (
  SELECT
    trim(value) AS value
FROM
  remove_chars
),
hyphenated AS (
  SELECT
    regexp_replace(value, E'[-\\s]+', '-', 'gi') AS value
FROM
  trimmed
),
underscored AS (
  SELECT
    regexp_replace(value, E'[-]+', '_', 'gi') AS value
FROM
  hyphenated
),
removedups AS (
  SELECT
    regexp_replace(value, E'[_]+', '_', 'gi') AS value
FROM
  underscored
)
SELECT
  value
FROM
  removedups;
$$
LANGUAGE SQL
STRICT IMMUTABLE;
-- default false overload
CREATE FUNCTION inflection.pg_slugify (text)
  RETURNS text
  AS 'SELECT inflection.pg_slugify($1, false)'
  LANGUAGE SQL
  IMMUTABLE;
COMMIT;

