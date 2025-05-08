-- Verify schemas/uuids/procedures/trigger_set_uuid_seed  on pg

BEGIN;

SELECT verify_function ('uuids.trigger_set_uuid_seed');

ROLLBACK;
