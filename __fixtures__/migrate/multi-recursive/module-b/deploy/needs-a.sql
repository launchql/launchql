-- Deploy module-b:needs-a to pg
-- requires: base-b
-- requires: module-a:@a1.0.0

BEGIN;

CREATE TABLE module_b.integration (
    id SERIAL PRIMARY KEY,
    base_id INTEGER NOT NULL REFERENCES module_b.base(id),
    module_a_core_id INTEGER NOT NULL REFERENCES module_a.core(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMIT;