-- Verify schemas/app_jobs/procedures/get_job  on pg

BEGIN;

SELECT verify_function ('app_jobs.get_job');

ROLLBACK;
