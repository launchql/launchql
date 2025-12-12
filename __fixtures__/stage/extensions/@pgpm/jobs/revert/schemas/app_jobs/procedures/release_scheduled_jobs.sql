-- Revert schemas/app_jobs/procedures/release_scheduled_jobs from pg

BEGIN;

DROP FUNCTION app_jobs.release_scheduled_jobs;

COMMIT;
