-- Revert schemas/app_jobs/procedures/run_scheduled_job from pg

BEGIN;

DROP FUNCTION app_jobs.run_scheduled_job;

COMMIT;
