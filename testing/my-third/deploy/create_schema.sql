-- Deploy my-third:create_schema to pg

-- requires: my-second:create_table

BEGIN;

CREATE SCHEMA IF NOT EXISTS metaschema;

COMMIT;
