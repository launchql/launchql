-- Deploy project-b:app_schema to pg
-- requires: project-a:base_schema

BEGIN;

CREATE SCHEMA app;

COMMIT;