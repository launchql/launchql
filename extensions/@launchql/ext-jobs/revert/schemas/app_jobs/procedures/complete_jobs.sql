-- Revert schemas/app_jobs/procedures/complete_jobs from pg

BEGIN;

DROP FUNCTION app_jobs.complete_jobs;

COMMIT;
