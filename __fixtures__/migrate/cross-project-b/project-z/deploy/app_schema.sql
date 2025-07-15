-- Deploy project-z:app_schema to pg
-- requires: project-x:@x1.1.0
-- requires: project-y:@y1.0.0

BEGIN;

CREATE SCHEMA app;
COMMENT ON SCHEMA app IS 'Main application schema';

COMMIT;