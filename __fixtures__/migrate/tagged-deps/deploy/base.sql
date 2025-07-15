-- Deploy tagged-deps:base to pg

BEGIN;

CREATE TABLE base_config (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMIT;