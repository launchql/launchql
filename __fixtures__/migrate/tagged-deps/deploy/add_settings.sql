-- Deploy tagged-deps:add_settings to pg
-- requires: base

BEGIN;

CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    config_id INTEGER NOT NULL REFERENCES base_config(id),
    name TEXT NOT NULL,
    value TEXT,
    type TEXT NOT NULL CHECK (type IN ('string', 'number', 'boolean', 'json')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(config_id, name)
);

COMMIT;