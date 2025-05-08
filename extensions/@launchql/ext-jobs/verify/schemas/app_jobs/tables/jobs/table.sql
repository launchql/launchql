-- Verify schemas/app_jobs/tables/jobs/table on pg

BEGIN;

SELECT verify_table ('app_jobs.jobs');

ROLLBACK;
