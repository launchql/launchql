-- Revert schemas/app_jobs/tables/jobs/grants/grant_select_insert_update_delete_to_administrator from pg

BEGIN;

REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE app_jobs.jobs FROM administrator;

COMMIT;
