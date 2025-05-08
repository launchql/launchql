-- Verify schemas/uuids/procedures/trigger_set_uuid_related_field  on pg

BEGIN;

SELECT verify_function ('uuids.trigger_set_uuid_related_field');

ROLLBACK;
