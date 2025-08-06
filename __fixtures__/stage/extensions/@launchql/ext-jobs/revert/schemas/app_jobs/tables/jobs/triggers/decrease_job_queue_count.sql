-- Revert schemas/app_jobs/tables/jobs/triggers/decrease_job_queue_count from pg
BEGIN;
DROP TRIGGER _500_decrease_job_queue_count_delete ON app_jobs.jobs;
DROP TRIGGER _500_decrease_job_queue_count_update ON app_jobs.jobs;
DROP FUNCTION app_jobs.tg_decrease_job_queue_count;
COMMIT;

