-- Revert schemas/app_jobs/tables/job_queues/grants/grant_select_insert_update_delete_to_administrator from pg

BEGIN;

REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE app_jobs.job_queues FROM administrator;

COMMIT;
