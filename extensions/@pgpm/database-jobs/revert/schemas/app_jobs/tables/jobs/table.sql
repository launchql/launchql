-- Revert schemas/app_jobs/tables/jobs/table from pg

BEGIN;

DROP TABLE app_jobs.jobs;

COMMIT;
