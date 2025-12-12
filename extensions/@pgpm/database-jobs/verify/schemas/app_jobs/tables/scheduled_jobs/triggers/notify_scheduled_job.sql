-- Verify schemas/app_jobs/tables/scheduled_jobs/triggers/notify_scheduled_job  on pg

BEGIN;


SELECT verify_trigger ('app_jobs._900_notify_scheduled_job');

ROLLBACK;
