-- Deploy test-project:schema to pg

BEGIN;

CREATE SCHEMA IF NOT EXISTS app;

COMMIT;