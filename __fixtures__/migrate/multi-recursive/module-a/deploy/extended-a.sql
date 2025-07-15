-- Deploy module-a:extended-a to pg
-- requires: core-a

BEGIN;

CREATE TABLE module_a.extended (
    id SERIAL PRIMARY KEY,
    core_id INTEGER NOT NULL REFERENCES module_a.core(id),
    extra_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMIT;