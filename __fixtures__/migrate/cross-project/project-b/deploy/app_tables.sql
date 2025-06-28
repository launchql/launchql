-- Deploy project-b:app_tables to pg
-- requires: app_schema
-- requires: project-a:base_types

BEGIN;

CREATE TABLE app.items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    status base.status DEFAULT 'pending'
);

COMMIT;