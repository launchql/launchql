-- Revert schemas/app_jobs/tables/jobs/indexes/jobs_locked_by_idx from pg

BEGIN;

DROP INDEX app_jobs.jobs_locked_by_idx;

COMMIT;
