-- Verify schemas/app_jobs/tables/jobs/indexes/jobs_locked_by_idx  on pg

BEGIN;

SELECT verify_index ('app_jobs.jobs', 'jobs_locked_by_idx');

ROLLBACK;
