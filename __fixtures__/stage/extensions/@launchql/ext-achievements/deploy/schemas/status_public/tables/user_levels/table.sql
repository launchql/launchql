-- Deploy schemas/status_public/tables/user_levels/table to pg

-- requires: schemas/status_public/schema

BEGIN;

-- NOT using yet, so commented it out for simplicity

-- CREATE TABLE status_public.user_levels (
--     id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
--     user_id uuid NOT NULL,
--     name text NOT NULL, -- references levels
--     created_at timestamptz NOT NULL DEFAULT current_timestamp  
-- );

-- COMMENT ON TABLE status_public.user_levels IS 'Cache table of the achieved levels';

-- CREATE INDEX ON status_public.user_levels (user_id, name);

COMMIT;
