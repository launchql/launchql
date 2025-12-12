-- Revert schemas/app_jobs/procedures/release_jobs from pg

BEGIN;

DROP FUNCTION app_jobs.release_jobs;

COMMIT;
