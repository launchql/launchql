BEGIN;

CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP SCHEMA IF EXISTS introspectron CASCADE;
CREATE SCHEMA introspectron;

-- Users table
CREATE TABLE introspectron.users (
    id serial PRIMARY KEY,
    username citext NOT NULL UNIQUE CHECK (length(username) < 127),
    email citext,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Posts table
CREATE TABLE introspectron.posts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id int NOT NULL REFERENCES introspectron.users(id),
    title text NOT NULL,
    body text,
    published boolean DEFAULT false,
    published_at timestamptz
);

-- A simple view (to test classKind !== 'r')
CREATE VIEW introspectron.active_users AS
SELECT id, username FROM introspectron.users WHERE username IS NOT NULL;

-- A function (to test procedure introspection)
CREATE FUNCTION introspectron.user_count() RETURNS integer AS $$
BEGIN
  RETURN (SELECT count(*) FROM introspectron.users);
END;
$$ LANGUAGE plpgsql STABLE;

COMMIT;
