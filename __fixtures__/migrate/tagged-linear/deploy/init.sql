-- Deploy tagged-linear:init to pg

BEGIN;

-- Initialize database schema
CREATE SCHEMA IF NOT EXISTS app;

COMMIT;