-- Verify schemas/app_jobs/triggers/tg_update_timestamps  on pg

BEGIN;

SELECT verify_function ('app_jobs.tg_update_timestamps');

ROLLBACK;
