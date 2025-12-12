-- Deploy schemas/app_jobs/tables/job_queues/grants/grant_select_insert_update_delete_to_administrator to pg

-- requires: schemas/app_jobs/schema
-- requires: schemas/app_jobs/tables/job_queues/table

BEGIN;

-- TODO make sure to require any policies on this table!

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app_jobs.job_queues TO administrator;

COMMIT;
