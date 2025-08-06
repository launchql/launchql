-- Revert schemas/app_jobs/procedures/get_job from pg

BEGIN;

DROP FUNCTION app_jobs.get_job;

COMMIT;
