-- Revert schemas/app_jobs/procedures/do_notify from pg

BEGIN;

DROP FUNCTION app_jobs.do_notify;

COMMIT;
