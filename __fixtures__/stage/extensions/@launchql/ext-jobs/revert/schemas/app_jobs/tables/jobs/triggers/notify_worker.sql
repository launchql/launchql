-- Revert schemas/app_jobs/tables/jobs/triggers/notify_worker from pg
BEGIN;
DROP TRIGGER _900_notify_worker ON app_jobs.jobs;
COMMIT;

