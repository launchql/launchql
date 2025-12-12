-- Revert schemas/app_jobs/tables/jobs/triggers/decrease_job_queue_count from pg
BEGIN;
DROP TRIGGER decrease_job_queue_count_on_delete ON app_jobs.jobs;
DROP TRIGGER decrease_job_queue_count_on_update ON app_jobs.jobs;
DROP FUNCTION app_jobs.tg_decrease_job_queue_count;
COMMIT;

