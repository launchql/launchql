-- Deploy schemas/app_jobs/tables/scheduled_jobs/indexes/scheduled_jobs_priority_id_idx to pg
-- requires: schemas/app_jobs/schema
-- requires: schemas/app_jobs/tables/scheduled_jobs/table

BEGIN;
CREATE INDEX scheduled_jobs_priority_id_idx ON app_jobs.scheduled_jobs (priority, id);
COMMIT;

