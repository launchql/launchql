-- Revert schemas/app_jobs/tables/jobs/indexes/priority_run_at_id_idx from pg

BEGIN;

DROP INDEX app_jobs.priority_run_at_id_idx;

COMMIT;
