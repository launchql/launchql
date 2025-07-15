-- Deploy tagged-partial:d to pg
-- requires: c

BEGIN;

CREATE TABLE test_d (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMIT;