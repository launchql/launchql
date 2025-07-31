-- Deploy my-first:schema_myfirstapp to pg

BEGIN;

CREATE SCHEMA IF NOT EXISTS myfirstapp;

COMMIT;
