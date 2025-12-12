-- Revert schemas/app_jobs/triggers/tg_update_timestamps from pg

BEGIN;

DROP FUNCTION app_jobs.tg_update_timestamps;

COMMIT;
