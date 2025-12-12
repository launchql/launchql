-- Revert schemas/app_jobs/tables/scheduled_jobs/indexes/scheduled_jobs_priority_id_idx from pg

BEGIN;

DROP INDEX app_jobs.scheduled_jobs_priority_id_idx;

COMMIT;
