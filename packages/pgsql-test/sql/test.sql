BEGIN;
CREATE EXTENSION IF NOT EXISTS citext;
DROP SCHEMA IF EXISTS app_public CASCADE;
CREATE SCHEMA app_public;
CREATE TABLE app_public.users (
    id serial PRIMARY KEY,
    username citext,
    UNIQUE (username),
    CHECK (length(username) < 127)
);
CREATE TABLE app_public.roles (
    id serial PRIMARY KEY,
    org_id bigint NOT NULL REFERENCES app_public.users (id)
);
CREATE TABLE app_public.user_settings (
    user_id bigint NOT NULL PRIMARY KEY REFERENCES app_public.users (id),
    setting text,
    UNIQUE (user_id)
);
COMMIT;

