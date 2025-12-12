-- Revert schemas/app_jobs/tables/scheduled_jobs/indexes/scheduled_jobs_locked_by_idx from pg

BEGIN;

DROP INDEX app_jobs.scheduled_jobs_locked_by_idx;

COMMIT;
