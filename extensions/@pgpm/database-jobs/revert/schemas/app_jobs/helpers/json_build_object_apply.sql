-- Revert schemas/app_jobs/helpers/json_build_object_apply from pg

BEGIN;

DROP FUNCTION app_jobs.json_build_object_apply;

COMMIT;
