-- Verify schemas/app_jobs/tables/job_queues/table on pg

BEGIN;

SELECT verify_table ('app_jobs.job_queues');

ROLLBACK;
