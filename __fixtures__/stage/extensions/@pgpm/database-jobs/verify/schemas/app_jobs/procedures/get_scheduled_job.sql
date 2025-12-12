-- Verify schemas/app_jobs/procedures/get_scheduled_job  on pg

BEGIN;

SELECT verify_function ('app_jobs.get_scheduled_job');

ROLLBACK;
