-- Deploy tagged-partial:e to pg
-- requires: d

BEGIN;

CREATE TABLE test_e (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMIT;