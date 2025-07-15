-- Deploy tagged-partial:c to pg
-- requires: b

BEGIN;

CREATE TABLE test_c (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMIT;