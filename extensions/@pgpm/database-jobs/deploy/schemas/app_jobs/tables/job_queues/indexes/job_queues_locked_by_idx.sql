-- Deploy schemas/app_jobs/tables/job_queues/indexes/job_queues_locked_by_idx to pg
-- requires: schemas/app_jobs/schema
-- requires: schemas/app_jobs/tables/job_queues/table

BEGIN;
CREATE INDEX job_queues_locked_by_idx ON app_jobs.job_queues (locked_by);
COMMIT;

