-- Deploy schemas/inflection/procedures/dashed to pg

-- requires: schemas/inflection/schema
-- requires: schemas/inflection/procedures/underscore

BEGIN;

CREATE FUNCTION inflection.dashed(str text)
  RETURNS text
  AS $$
  WITH underscored AS (
    SELECT
      inflection.underscore(str) AS value
),
dashes AS (
  SELECT
    regexp_replace(value, '_', '-', 'gi') AS value
  FROM
    underscored
)
SELECT
  value
FROM
  dashes;
$$
LANGUAGE 'sql'
IMMUTABLE;
COMMIT;

