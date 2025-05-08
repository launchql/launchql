-- Verify schemas/app_jobs/triggers/tg_add_job_with_fields  on pg

BEGIN;

SELECT verify_function ('app_jobs.trigger_job_with_fields');

ROLLBACK;
