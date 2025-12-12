-- Revert schemas/app_jobs/procedures/add_scheduled_job from pg

BEGIN;

DROP FUNCTION app_jobs.add_scheduled_job;

COMMIT;
