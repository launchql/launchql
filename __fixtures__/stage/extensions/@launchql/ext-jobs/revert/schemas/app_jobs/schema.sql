-- Revert schemas/app_jobs/schema from pg

BEGIN;

DROP SCHEMA app_jobs;

COMMIT;
