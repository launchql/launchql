-- Deploy schemas/app_jobs/tables/scheduled_jobs/grants/grant_select_insert_update_delete_to_administrator to pg

-- requires: schemas/app_jobs/schema
-- requires: schemas/app_jobs/tables/scheduled_jobs/table

BEGIN;

-- TODO make sure to require any policies on this table!

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app_jobs.scheduled_jobs TO administrator;

COMMIT;
