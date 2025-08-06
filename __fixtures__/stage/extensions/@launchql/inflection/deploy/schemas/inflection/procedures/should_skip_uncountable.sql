-- Deploy schemas/inflection/procedures/should_skip_uncountable to pg
-- requires: schemas/inflection/schema
-- requires: schemas/inflection/procedures/uncountable_words

BEGIN;

CREATE FUNCTION inflection.should_skip_uncountable (str text)
  RETURNS boolean
  AS $$
  SELECT
    str = ANY (inflection.uncountable_words ());
$$
LANGUAGE 'sql'
IMMUTABLE;

COMMIT;

