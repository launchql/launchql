BEGIN;

CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP SCHEMA IF EXISTS launchql_gen CASCADE;
CREATE SCHEMA launchql_gen;

-- Users table
CREATE TABLE launchql_gen.users (
    id serial PRIMARY KEY,
    username citext NOT NULL UNIQUE CHECK (length(username) < 127),
    email citext,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Posts table
CREATE TABLE launchql_gen.posts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id int NOT NULL REFERENCES launchql_gen.users(id),
    title text NOT NULL,
    body text,
    published boolean DEFAULT false,
    published_at timestamptz
);

-- A simple view (to test classKind !== 'r')
CREATE VIEW launchql_gen.active_users AS
SELECT id, username FROM launchql_gen.users WHERE username IS NOT NULL;

-- A function (to test procedure introspection)
CREATE FUNCTION launchql_gen.user_count() RETURNS integer AS $$
BEGIN
  RETURN (SELECT count(*) FROM launchql_gen.users);
END;
$$ LANGUAGE plpgsql STABLE;

COMMIT;
