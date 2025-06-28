-- Deploy test-project:users to pg
-- requires: schema

BEGIN;

CREATE TABLE app.users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMIT;