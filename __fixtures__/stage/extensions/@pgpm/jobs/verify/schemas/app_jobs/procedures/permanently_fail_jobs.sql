-- Verify schemas/app_jobs/procedures/permanently_fail_jobs  on pg

BEGIN;

SELECT verify_function ('app_jobs.permanently_fail_jobs');

ROLLBACK;
