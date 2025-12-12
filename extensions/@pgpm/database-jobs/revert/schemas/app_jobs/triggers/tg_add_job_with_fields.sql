-- Revert schemas/app_jobs/triggers/tg_add_job_with_fields from pg

BEGIN;

DROP FUNCTION app_jobs.trigger_job_with_fields;

COMMIT;
