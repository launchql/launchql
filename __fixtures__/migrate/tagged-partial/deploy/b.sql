-- Deploy tagged-partial:b to pg
-- requires: a

BEGIN;

CREATE TABLE test_b (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMIT;