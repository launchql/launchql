-- Deploy schemas/app_jobs/schema to pg
BEGIN;
CREATE SCHEMA IF NOT EXISTS app_jobs;
GRANT USAGE ON SCHEMA app_jobs TO administrator;
ALTER DEFAULT PRIVILEGES IN SCHEMA app_jobs GRANT EXECUTE ON FUNCTIONS TO administrator;
COMMIT;

