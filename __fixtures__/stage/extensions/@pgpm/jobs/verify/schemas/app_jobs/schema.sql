-- Verify schemas/app_jobs/schema  on pg

BEGIN;

SELECT verify_schema ('app_jobs');

ROLLBACK;
