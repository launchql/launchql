-- Revert schemas/app_jobs/procedures/add_job from pg

BEGIN;

DROP FUNCTION app_jobs.add_job;

COMMIT;
