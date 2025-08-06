-- Deploy schemas/uuids/procedures/trigger_set_uuid_seed to pg

-- requires: schemas/uuids/schema
-- requires: schemas/uuids/procedures/pseudo_order_seed_uuid

BEGIN;

-- https://dba.stackexchange.com/questions/61271/how-to-access-new-or-old-field-given-only-the-fields-name
-- https://dba.stackexchange.com/questions/82039/assign-to-new-by-key-in-a-postgres-trigger/82044#82044
-- https://stackoverflow.com/questions/7711432/how-to-set-value-of-composite-variable-field-using-dynamic-sql

-- usage CREATE TRIGGER ...
-- EXECUTE PROCEDURE uuids.trigger_set_uuid_seed ('id', '41c33217-a5e5-46d1-c8db-62a563cba3af');

CREATE FUNCTION uuids.trigger_set_uuid_seed()
RETURNS TRIGGER AS $$
BEGIN
    NEW := NEW #= (TG_ARGV[0] || '=>' || uuids.pseudo_order_seed_uuid(TG_ARGV[1]))::hstore;
    RETURN NEW;
END;
$$
LANGUAGE 'plpgsql' VOLATILE;

COMMIT;
