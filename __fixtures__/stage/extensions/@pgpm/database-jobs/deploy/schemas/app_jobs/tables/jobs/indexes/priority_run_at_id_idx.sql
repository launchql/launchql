-- Deploy schemas/app_jobs/tables/jobs/indexes/priority_run_at_id_idx to pg
-- requires: schemas/app_jobs/schema
-- requires: schemas/app_jobs/tables/jobs/table

BEGIN;
CREATE INDEX priority_run_at_id_idx ON app_jobs.jobs (priority, run_at, id);
COMMIT;

