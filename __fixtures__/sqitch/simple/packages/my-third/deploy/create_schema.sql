-- Deploy my-third:create_schema to pg

-- requires: my-second:create_table

BEGIN;

CREATE SCHEMA mythirdapp;

COMMIT;
