-- Deploy my-first:schema_myapp to pg

BEGIN;

CREATE SCHEMA IF NOT EXISTS myapp;

COMMIT;
