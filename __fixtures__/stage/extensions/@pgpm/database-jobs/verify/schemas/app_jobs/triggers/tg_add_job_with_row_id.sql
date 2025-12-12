-- Verify schemas/app_jobs/triggers/tg_add_job_with_row_id  on pg
BEGIN;
SELECT
    verify_function ('app_jobs.tg_add_job_with_row_id');
ROLLBACK;

