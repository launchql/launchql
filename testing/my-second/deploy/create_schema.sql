-- Deploy my-second:create_schema to pg

BEGIN;

CREATE SCHEMA IF NOT EXISTS otherschema;

COMMIT;
