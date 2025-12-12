-- Revert schemas/app_jobs/procedures/permanently_fail_jobs from pg

BEGIN;

DROP FUNCTION app_jobs.permanently_fail_jobs;

COMMIT;
