-- Deploy project-a:base_types to pg
-- requires: base_schema

BEGIN;

CREATE TYPE base.status AS ENUM ('active', 'inactive', 'pending');

COMMIT;