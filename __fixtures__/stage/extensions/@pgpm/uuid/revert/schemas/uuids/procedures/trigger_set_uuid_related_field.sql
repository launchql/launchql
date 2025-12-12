-- Revert schemas/uuids/procedures/trigger_set_uuid_related_field from pg

BEGIN;

DROP FUNCTION uuids.trigger_set_uuid_related_field;

COMMIT;
