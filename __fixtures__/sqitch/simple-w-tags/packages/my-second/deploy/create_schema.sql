-- Deploy my-second:create_schema to pg
-- requires: my-first:@v1.0.0

BEGIN;

CREATE SCHEMA otherschema;

COMMIT;
