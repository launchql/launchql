-- Verify schemas/app_jobs/procedures/release_scheduled_jobs  on pg

BEGIN;

SELECT verify_function ('app_jobs.release_scheduled_jobs');

ROLLBACK;
