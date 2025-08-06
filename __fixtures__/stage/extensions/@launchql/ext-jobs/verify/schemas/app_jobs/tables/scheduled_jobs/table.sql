-- Verify schemas/app_jobs/tables/scheduled_jobs/table on pg

BEGIN;

SELECT verify_table ('app_jobs.scheduled_jobs');

ROLLBACK;
