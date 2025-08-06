-- Deploy schemas/inflection/procedures/slugify_trigger to pg

-- requires: schemas/inflection/schema
-- requires: schemas/inflection/procedures/slugify

BEGIN;

-- USAGE inflection.slugify_trigger ('field_name')

CREATE FUNCTION inflection.slugify_trigger()
RETURNS TRIGGER AS $$
DECLARE
    value text := to_json(NEW) ->> TG_ARGV[0];
BEGIN
    NEW := NEW #= (TG_ARGV[0] || '=>' || inflection.slugify(value))::hstore;
    RETURN NEW;
END;
$$
LANGUAGE 'plpgsql' VOLATILE;

COMMIT;