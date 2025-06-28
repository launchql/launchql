-- Deploy test-project:posts to pg
-- requires: users

BEGIN;

CREATE TABLE app.posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES app.users(id),
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMIT;