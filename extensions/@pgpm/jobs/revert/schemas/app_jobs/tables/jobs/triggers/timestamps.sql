-- Revert schemas/app_jobs/tables/jobs/triggers/timestamps from pg
BEGIN;
ALTER TABLE app_jobs.jobs
    DROP COLUMN created_at;
ALTER TABLE app_jobs.jobs
    DROP COLUMN updated_at;
DROP TRIGGER _100_update_jobs_modtime_tg ON app_jobs.jobs;
COMMIT;

