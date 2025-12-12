-- Verify schemas/app_jobs/helpers/json_build_object_apply  on pg

BEGIN;

SELECT verify_function ('app_jobs.json_build_object_apply');

ROLLBACK;
