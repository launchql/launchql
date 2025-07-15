-- Deploy tagged-partial:a to pg

BEGIN;

CREATE TABLE test_a (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMIT;