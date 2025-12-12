-- Revert schemas/status_private/procedures/upsert_achievement from pg

BEGIN;

DROP FUNCTION status_private.upsert_achievement;

COMMIT;
