-- Deploy module-a:core-a to pg

BEGIN;

CREATE SCHEMA module_a;

CREATE TABLE module_a.core (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMIT;