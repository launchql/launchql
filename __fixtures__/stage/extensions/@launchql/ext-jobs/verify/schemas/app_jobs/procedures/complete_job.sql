-- Verify schemas/app_jobs/procedures/complete_job  on pg

BEGIN;

SELECT verify_function ('app_jobs.complete_job');

ROLLBACK;
