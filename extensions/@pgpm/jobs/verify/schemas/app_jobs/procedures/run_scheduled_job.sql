-- Verify schemas/app_jobs/procedures/run_scheduled_job  on pg

BEGIN;

SELECT verify_function ('app_jobs.run_scheduled_job');

ROLLBACK;
