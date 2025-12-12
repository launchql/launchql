-- Verify schemas/app_jobs/procedures/complete_jobs  on pg

BEGIN;

SELECT verify_function ('app_jobs.complete_jobs');

ROLLBACK;
