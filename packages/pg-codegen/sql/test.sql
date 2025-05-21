BEGIN;

CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP SCHEMA IF EXISTS codegen_test CASCADE;
CREATE SCHEMA codegen_test;

-- Users table
CREATE TABLE codegen_test.users (
    id serial PRIMARY KEY,
    username citext NOT NULL UNIQUE CHECK (length(username) < 127),
    email citext,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Posts table
CREATE TABLE codegen_test.posts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id int NOT NULL REFERENCES codegen_test.users(id),
    title text NOT NULL,
    body text,
    published boolean DEFAULT false,
    published_at timestamptz
);

-- A simple view (to test classKind !== 'r')
CREATE VIEW codegen_test.active_users AS
SELECT id, username FROM codegen_test.users WHERE username IS NOT NULL;

-- A function (to test procedure introspection)
CREATE FUNCTION codegen_test.user_count() RETURNS integer AS $$
BEGIN
  RETURN (SELECT count(*) FROM codegen_test.users);
END;
$$ LANGUAGE plpgsql STABLE;

COMMIT;
