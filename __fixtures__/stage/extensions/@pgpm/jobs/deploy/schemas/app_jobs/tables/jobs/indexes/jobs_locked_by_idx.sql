-- Deploy schemas/app_jobs/tables/jobs/indexes/jobs_locked_by_idx to pg
-- requires: schemas/app_jobs/schema
-- requires: schemas/app_jobs/tables/jobs/table

BEGIN;
CREATE INDEX jobs_locked_by_idx ON app_jobs.jobs (locked_by);
COMMIT;

