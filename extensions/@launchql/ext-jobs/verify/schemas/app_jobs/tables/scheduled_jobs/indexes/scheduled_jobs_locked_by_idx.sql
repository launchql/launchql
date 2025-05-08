-- Verify schemas/app_jobs/tables/scheduled_jobs/indexes/scheduled_jobs_locked_by_idx  on pg

BEGIN;

SELECT verify_index ('app_jobs.scheduled_jobs', 'scheduled_jobs_locked_by_idx');

ROLLBACK;
