-- Revert schemas/uuids/schema from pg

BEGIN;

DROP SCHEMA uuids;

COMMIT;
