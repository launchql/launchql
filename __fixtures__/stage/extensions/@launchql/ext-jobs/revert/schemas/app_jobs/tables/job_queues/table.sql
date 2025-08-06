-- Revert schemas/app_jobs/tables/job_queues/table from pg

BEGIN;

DROP TABLE app_jobs.job_queues;

COMMIT;
