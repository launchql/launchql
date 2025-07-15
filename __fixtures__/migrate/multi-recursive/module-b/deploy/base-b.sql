-- Deploy module-b:base-b to pg

BEGIN;

CREATE SCHEMA module_b;

CREATE TABLE module_b.base (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMIT;