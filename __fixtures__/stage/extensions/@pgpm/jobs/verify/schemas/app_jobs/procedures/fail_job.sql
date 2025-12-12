-- Verify schemas/app_jobs/procedures/fail_job  on pg

BEGIN;

SELECT verify_function ('app_jobs.fail_job');

ROLLBACK;
