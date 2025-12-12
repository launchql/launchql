-- Verify schemas/app_jobs/tables/jobs/indexes/priority_run_at_id_idx  on pg

BEGIN;

SELECT verify_index ('app_jobs.jobs', 'priority_run_at_id_idx');

ROLLBACK;
