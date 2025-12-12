-- Revert schemas/app_jobs/tables/scheduled_jobs/table from pg

BEGIN;

DROP TABLE app_jobs.scheduled_jobs;

COMMIT;
