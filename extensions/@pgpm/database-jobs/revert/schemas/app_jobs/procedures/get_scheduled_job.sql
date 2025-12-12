-- Revert schemas/app_jobs/procedures/get_scheduled_job from pg

BEGIN;

DROP FUNCTION app_jobs.get_scheduled_job;

COMMIT;
