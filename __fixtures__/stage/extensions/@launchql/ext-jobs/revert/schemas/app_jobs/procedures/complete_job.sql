-- Revert schemas/app_jobs/procedures/complete_job from pg

BEGIN;

DROP FUNCTION app_jobs.complete_job;

COMMIT;
