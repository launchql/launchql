-- Deploy my-third:create_table to pg
-- requires: my-third:@v2.0.0
-- requires: my-second:@v2.1.0

BEGIN;

CREATE TABLE mythirdapp.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_active_at TIMESTAMPTZ
);

COMMIT;
