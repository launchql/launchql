-- Revert schemas/app_jobs/tables/scheduled_jobs/triggers/notify_scheduled_job from pg

BEGIN;

DROP TRIGGER _900_notify_scheduled_job ON app_jobs.scheduled_jobs;


COMMIT;
