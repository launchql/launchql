-- Deploy my-second:create_table to pg

-- requires: my-second:create_schema

BEGIN;

-- Table 1: Users
CREATE TABLE otherschema.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_active_at TIMESTAMPTZ
);

COMMIT;
