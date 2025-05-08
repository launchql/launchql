-- Revert schemas/app_jobs/tables/jobs/triggers/increase_job_queue_count from pg
BEGIN;
DROP TRIGGER _500_increase_job_queue_count_on_insert ON app_jobs.jobs;
DROP TRIGGER _500_increase_job_queue_count_on_update ON app_jobs.jobs;
DROP FUNCTION app_jobs.tg_increase_job_queue_count;
COMMIT;

