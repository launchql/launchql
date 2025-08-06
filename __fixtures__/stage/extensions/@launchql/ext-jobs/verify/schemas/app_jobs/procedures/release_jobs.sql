-- Verify schemas/app_jobs/procedures/release_jobs  on pg

BEGIN;

SELECT verify_function ('app_jobs.release_jobs');

ROLLBACK;
