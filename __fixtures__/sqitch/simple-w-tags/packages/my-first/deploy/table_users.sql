-- Deploy my-first:table_users to pg

-- requires: my-first:schema_myfirstapp

BEGIN;

CREATE TABLE myfirstapp.users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT now()
);

COMMIT;
