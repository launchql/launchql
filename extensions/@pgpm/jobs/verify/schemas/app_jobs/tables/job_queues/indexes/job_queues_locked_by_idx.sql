-- Verify schemas/app_jobs/tables/job_queues/indexes/job_queues_locked_by_idx  on pg

BEGIN;

SELECT verify_index ('app_jobs.job_queues', 'job_queues_locked_by_idx');

ROLLBACK;
