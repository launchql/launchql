-- Revert schemas/app_jobs/triggers/tg_add_job_with_row_id from pg
BEGIN;
DROP FUNCTION app_jobs.tg_add_job_with_row_id;
COMMIT;

