-- Deploy my-third:create_schema to pg

-- requires: my-first:@v1.1.0
-- requires: my-second:@v2.0.0

BEGIN;

CREATE SCHEMA mythirdapp;

COMMIT;
