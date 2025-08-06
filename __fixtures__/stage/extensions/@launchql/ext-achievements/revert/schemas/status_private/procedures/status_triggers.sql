-- Revert schemas/status_private/procedures/status_triggers from pg

BEGIN;

DROP FUNCTION status_private.status_triggers;

COMMIT;
