-- Revert schemas/uuids/procedures/trigger_set_uuid_seed from pg

BEGIN;

DROP FUNCTION uuids.trigger_set_uuid_seed;

COMMIT;
