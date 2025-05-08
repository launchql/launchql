-- Deploy schemas/app_jobs/tables/jobs/grants/grant_select_insert_update_delete_to_administrator to pg

-- requires: schemas/app_jobs/schema
-- requires: schemas/app_jobs/tables/jobs/table

BEGIN;

-- TODO make sure to require any policies on this table!

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app_jobs.jobs TO administrator;

COMMIT;
