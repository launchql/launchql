-- Revert schemas/app_jobs/procedures/reschedule_jobs from pg

BEGIN;

DROP FUNCTION app_jobs.reschedule_jobs;

COMMIT;
