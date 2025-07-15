-- Deploy tagged-deps:add_features to pg
-- requires: add_settings

BEGIN;

CREATE TABLE features (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    enabled BOOLEAN DEFAULT FALSE,
    settings_id INTEGER REFERENCES settings(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMIT;