-- Deploy my-first:table_users to pg

-- requires: my-first:schema_myapp

BEGIN;

CREATE TABLE myapp.users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT now()
);

COMMIT;
