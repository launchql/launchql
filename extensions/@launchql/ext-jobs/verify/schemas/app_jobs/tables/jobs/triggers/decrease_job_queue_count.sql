-- Verify schemas/app_jobs/tables/jobs/triggers/decrease_job_queue_count  on pg
BEGIN;
SELECT
    verify_function ('app_jobs.tg_decrease_job_queue_count');
SELECT
    verify_trigger ('app_jobs._500_decrease_job_queue_count_on_delete');
SELECT
    verify_trigger ('app_jobs._500_decrease_job_queue_count_on_update');
ROLLBACK;

