-- https://en.wikipedia.org/wiki/Role-based_access_control
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
    setting1 text,
    UNIQUE (user_id)
);
CREATE TABLE app_public.permissions (
    id serial PRIMARY KEY,
    name citext
);
CREATE TABLE app_public.permission_assignment (
    perm_id bigint NOT NULL REFERENCES app_public.permissions (id),
    role_id bigint NOT NULL REFERENCES app_public.roles (id),
    PRIMARY KEY (perm_id, role_id)
);
CREATE TABLE app_public.subject_assignment (
    subj_id bigint NOT NULL REFERENCES app_public.users (id),
    role_id bigint NOT NULL REFERENCES app_public.roles (id),
    PRIMARY KEY (subj_id, role_id)
);
COMMIT;

