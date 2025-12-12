-- Verify schemas/app_jobs/procedures/add_scheduled_job  on pg

BEGIN;

SELECT verify_function ('app_jobs.add_scheduled_job');

ROLLBACK;
