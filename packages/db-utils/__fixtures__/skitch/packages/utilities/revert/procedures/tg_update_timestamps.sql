-- Revert procedures/tg_update_timestamps from pg

BEGIN;

DROP FUNCTION tg_update_timestamps;

COMMIT;
