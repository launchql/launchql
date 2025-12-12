-- Deploy schemas/uuids/procedures/trigger_set_uuid_related_field to pg

-- requires: schemas/uuids/schema
-- requires: schemas/uuids/procedures/pseudo_order_seed_uuid

BEGIN;

-- https://dba.stackexchange.com/questions/61271/how-to-access-new-or-old-field-given-only-the-fields-name
-- https://dba.stackexchange.com/questions/82039/assign-to-new-by-key-in-a-postgres-trigger/82044#82044
-- https://stackoverflow.com/questions/7711432/how-to-set-value-of-composite-variable-field-using-dynamic-sql

-- usage CREATE TRIGGER ...
-- EXECUTE PROCEDURE uuids.trigger_set_uuid_seed ('id', 'database_id');

CREATE FUNCTION uuids.trigger_set_uuid_related_field()
RETURNS TRIGGER AS $$
DECLARE
    _seed_column text := to_json(NEW) ->> TG_ARGV[1];
BEGIN
    IF _seed_column IS NULL THEN
        RAISE EXCEPTION 'UUID seed is NULL on table %', TG_TABLE_NAME;
    END IF;
    NEW := NEW #= (TG_ARGV[0] || '=>' || uuids.pseudo_order_seed_uuid(_seed_column))::hstore;
    RETURN NEW;
END;
$$
LANGUAGE 'plpgsql' VOLATILE;

COMMIT;
