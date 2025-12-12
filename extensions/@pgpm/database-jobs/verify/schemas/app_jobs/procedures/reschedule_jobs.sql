-- Verify schemas/app_jobs/procedures/reschedule_jobs  on pg

BEGIN;

SELECT verify_function ('app_jobs.reschedule_jobs');

ROLLBACK;
