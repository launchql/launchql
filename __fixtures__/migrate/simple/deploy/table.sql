-- Deploy test-simple:table to pg
-- requires: schema

BEGIN;

CREATE TABLE test_app.users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMIT;