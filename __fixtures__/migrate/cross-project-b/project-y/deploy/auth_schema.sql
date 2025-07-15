-- Deploy project-y:auth_schema to pg
-- requires: project-x:@x1.0.0

BEGIN;

CREATE SCHEMA IF NOT EXISTS auth;
COMMENT ON SCHEMA auth IS 'Authentication and authorization schema';

COMMIT;